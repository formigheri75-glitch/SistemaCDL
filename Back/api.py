import pyodbc  # type: ignore
from flask import Flask, jsonify, request, send_from_directory # type: ignore
from datetime import datetime
from pathlib import Path
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
from flask_jwt_extended import JWTManager,create_access_token,jwt_required,get_jwt_identity# type: ignore
from flask_cors import CORS  # type: ignore

BASE_DIR = Path(__file__).resolve().parent.parent

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path='')
app.config['JSON_SORT_KEYS'] = False
app.config["JWT_SECRET_KEY"] = "sua_chave_super_secreta"

jwt = JWTManager(app)
CORS(app)

dados_conexao = (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=localhost\\SQLEXPRESS;"
    "Database=SistemaCDL;"
    "Trusted_Connection=yes;"
)

# Try to connect to database
conexao = None
cursor = None
try:
    conexao = pyodbc.connect(dados_conexao)
    cursor = conexao.cursor()
    print("✓ Conexão ao banco de dados estabelecida com sucesso!")
except Exception as e:
    print(f"✗ Erro ao conectar ao banco de dados: {e}")

@app.route('/')
def index():
    return app.send_static_file('login.html')


@app.route('/debug')
def debug_page():
    return app.send_static_file('debug.html')


@app.route('/api/debug/status', methods=['GET'])
def debug_status():
    """Debug endpoint to check API and database status"""
    status = {
        "api": "online",
        "database": "offline",
        "users_count": 0,
        "error": None
    }
    
    try:
        if cursor:
            cursor.execute("SELECT COUNT(*) FROM Usuario")
            count = cursor.fetchone()[0]
            status["database"] = "online"
            status["users_count"] = count
            
            # List users (for debug only)
            cursor.execute("SELECT ID, Email FROM Usuario")
            users = cursor.fetchall()
            status["users"] = [{"id": u[0], "email": u[1]} for u in users]
    except Exception as e:
        status["database"] = "offline"
        status["error"] = str(e)
    
    return jsonify(status), 200 if status["database"] == "online" else 500


@app.route('/instituicoes', methods=['GET'])
def obter_instituicoes():
    try:
        cursor.execute("SELECT * FROM Instituicao ORDER BY ID")
        instituicoes = cursor.fetchall()
        
        resultado = []
        for inst in instituicoes:
            resultado.append({
                "id": inst[0],
                "nomeInstituicao": inst[1],
                "cnpj": inst[2],
                "email": inst[3],
                "celular": inst[4],
                "cidade": inst[5],
                "estado": inst[6],
                "endereco": inst[7],
                "dataCadastro": str(inst[8]) if inst[8] else None,
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/instituicoes/<int:id>', methods=['GET'])
def obter_instituicao(id):
    try:
        cursor.execute("SELECT * FROM Instituicao WHERE ID = ?", id)
        inst = cursor.fetchone()
        
        if not inst:
            return jsonify({"erro": "Instituição não encontrada"}), 404
        
        return jsonify({
            "id": inst[0],
            "nomeInstituicao": inst[1],
            "cnpj": inst[2],
            "email": inst[3],
            "celular": inst[4],
            "cidade": inst[5],
            "estado": inst[6],
            "endereco": inst[7],
            "dataCadastro": str(inst[8]) if inst[8] else None,
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/instituicoes', methods=['POST'])
def criar_instituicao():
    try:
        dados = request.get_json()

        senha_hash = generate_password_hash(dados.get('Senha'))
        cursor.execute("""
            INSERT INTO Instituicao (NomeInstituicao, CNPJ, Email, Celular, Cidade, Estado, Endereco, DataCadastro,Senha)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
     
            dados.get('nomeInstituicao'),
            dados.get('cnpj'),
            dados.get('email'),
            dados.get('celular'),
            dados.get('cidade'),
            dados.get('estado'),
            dados.get('endereco'),
            datetime.now(),
            senha_hash
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Instituição criada com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    """Login endpoint - authenticate user with email and password"""
    
    if not cursor:
        return jsonify({
            "erro": "Banco de dados não disponível. Entre em contato com o administrador."
        }), 503

    try:
        dados = request.get_json()

        email = dados.get('email', '').strip()
        senha = dados.get('senha', '').strip()
        
        if not email or not senha:
            return jsonify({
                "erro": "Email e senha são obrigatórios"
            }), 400

        cursor.execute(
            """
            SELECT ID, Senha
            FROM Usuario
            WHERE Email = ?
            """,
            (email,)
        )

        usuario = cursor.fetchone()

        if usuario:
            usuario_id = usuario[0]
            senha_hash = usuario[1]

            if check_password_hash(senha_hash, senha):
                token = create_access_token(
                    identity=str(usuario_id)
                )

                return jsonify({
                    "mensagem": "Login realizado",
                    "token": token
                }), 200

        return jsonify({
            "erro": "Email ou senha inválidos"
        }), 401
    
    except Exception as e:
        print(f"Erro no login: {e}")
        return jsonify({
            "erro": f"Erro ao processar login: {str(e)}"
        }), 500


@app.route('/usuarios/register', methods=['POST'])
def register_user():
    """Register a new user (development/testing endpoint)"""
    
    if not cursor:
        return jsonify({
            "erro": "Banco de dados não disponível"
        }), 503

    try:
        dados = request.get_json()
        email = dados.get('email', '').strip()
        senha = dados.get('senha', '').strip()
        nome = dados.get('nome', 'Novo Usuário')
        tipo = dados.get('tipo', 'instituicao')
        
        if not email or not senha:
            return jsonify({"erro": "Email e senha são obrigatórios"}), 400
        
        # Hash da senha
        senha_hash = generate_password_hash(senha)
        
        # Inserir usuário
        cursor.execute("""
            INSERT INTO Usuario (Nome, Email, Senha, TipoUsuario, DataCadastro, Ativo)
            VALUES (?, ?, ?, ?, GETDATE(), 1)
        """, (nome, email, senha_hash, tipo))
        conexao.commit()
        
        print(f"✓ Usuário criado: {email}")
        return jsonify({"mensagem": "Usuário criado com sucesso", "email": email}), 201
    except Exception as e:
        if conexao:
            conexao.rollback()
        print(f"✗ Erro ao registrar usuário: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/me/desafios', methods=['GET'])
@jwt_required()
def meus_desafios():

    try:

        # ID vindo do token
        usuario_id = get_jwt_identity()

        cursor.execute("""

            SELECT
                D.ID,
                D.Titulo,
                D.Descricao,
                D.Status

            FROM Desafio D

            INNER JOIN Empresa E
                ON D.EmpresaID = E.ID

            WHERE E.UsuarioID = ?

            ORDER BY D.ID

        """, (usuario_id,))

        desafios = cursor.fetchall()

        resultado = []

        for desafio in desafios:

            resultado.append({

                "id": desafio[0],
                "titulo": desafio[1],
                "descricao": desafio[2],
                "status": desafio[3]

            })

        return jsonify(resultado), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

@app.route('/me', methods=['GET'])
@jwt_required()
def me():

    try:

        usuario_id = get_jwt_identity()

        cursor.execute("""
            SELECT
                ID,
                Nome,
                Email,
                TipoUsuario
            FROM Usuario
            WHERE ID = ?
        """, (usuario_id,))

        usuario = cursor.fetchone()

        if usuario is None:

            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        return jsonify({

            "id": usuario[0],
            "nome": usuario[1],
            "email": usuario[2],
            "tipoUsuario": usuario[3]

        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500
    
    
@app.route('/usuarios', methods=['GET'])
def obter_usuarios():
    try:
        cursor.execute("SELECT * FROM Usuario ORDER BY ID")
        usuarios = cursor.fetchall()
        
        resultado = []
        for usuario in usuarios:
            resultado.append({
                "id": usuario[0],
                "nome": usuario[1],
                "email": usuario[2],
                "senha": usuario[3],
                "tipoUsuario": usuario[4],
                "dataCadastro": str(usuario[5]) if usuario[5] else None,
                "ativo": usuario[6]
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/usuarios/<int:id>', methods=['GET'])
def obter_usuario(id):
    try:
        cursor.execute("SELECT * FROM Usuario WHERE ID = ?", id)
        usuario = cursor.fetchone()
        
        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404
        
        return jsonify({
            "id": usuario[0],
            "nome": usuario[1],
            "email": usuario[2],
            "senha": usuario[3],
            "tipoUsuario": usuario[4],
            "dataCadastro": str(usuario[5]) if usuario[5] else None,
            "ativo": usuario[6]
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/add/usuarios', methods=['POST'])
def criar_usuario():
    try:
        dados = request.get_json()

        nome = dados['nome']
        email = dados['email']
        senha = dados['senha']

        senha_hash = generate_password_hash(senha)

        cursor.execute("""
            INSERT INTO Usuario
            (Nome, Email, Senha, TipoUsuario, DataCadastro, Ativo)
            VALUES (?, ?, ?, ?, GETDATE(), ?)
        """, (nome, email, senha_hash, 'Usuario', 1))

        conexao.commit()

        return jsonify({
            "mensagem": "Usuário criado com sucesso"
        })
    except Exception as e:      
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/usuarios/<int:id>', methods=['PUT'])
def atualizar_usuario(id):
    try:
        dados = request.get_json()
        
        cursor.execute("""
            UPDATE Usuario 
            SET Nome = ?, Email = ?, Senha = ?, TipoUsuario = ?, Ativo = ?
            WHERE ID = ?
        """, (
            dados.get('nome'),
            dados.get('email'),
            dados.get('senha'),
            dados.get('tipoUsuario'),
            dados.get('ativo'),
            id
        ))
        conexao.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Usuário não encontrado"}), 404
        
        return jsonify({"mensagem": "Usuário atualizado com sucesso"}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    try:
        cursor.execute("DELETE FROM Usuario WHERE ID = ?", id)
        conexao.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Usuário não encontrado"}), 404
        
        return jsonify({"mensagem": "Usuário deletado com sucesso"}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500



@app.route('/empresas', methods=['GET'])
def obter_empresas():
    try:
        cursor.execute("SELECT * FROM Empresa ORDER BY ID")
        empresas = cursor.fetchall()
        
        resultado = []
        for empresa in empresas:
            resultado.append({
                "id": empresa[0],
                "razaoSocial": empresa[1],
                "nomeFantasia": empresa[2],
                "cnpj": empresa[3],
                "email": empresa[4],
                "celular": empresa[5],
                "cidade": empresa[6],
                "estado": empresa[7],
                "endereco": empresa[8],
                "areaAtuacao": empresa[9],
                "dataCadastro": str(empresa[10]) if empresa[10] else None,
                "senha" : empresa[11]
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/empresas/<int:id>', methods=['GET'])
def obter_empresa(id):
    try:
        cursor.execute("SELECT * FROM Empresa WHERE ID = ?", id)
        empresa = cursor.fetchone()
        
        if not empresa:
            return jsonify({"erro": "Empresa não encontrada"}), 404
        
        return jsonify({
            "id": empresa[0],
            "razaoSocial": empresa[1],
            "nomeFantasia": empresa[2],
            "cnpj": empresa[3],
            "email": empresa[4],
            "celular": empresa[5],
            "cidade": empresa[6],
            "estado": empresa[7],
            "endereco": empresa[8],
            "areaAtuacao": empresa[9],
            "dataCadastro": str(empresa[10]) if empresa[10] else None,
            "senha" : empresa[11]
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/empresas', methods=['POST'])
def criar_empresa():
    try:
        dados = request.get_json()
        
        cursor.execute("""
            INSERT INTO Empresa (RazaoSocial, NomeFantasia, CNPJ, Email, Celular, Cidade, Estado, Endereco, AreaAtuacao, DataCadastro,Senha)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        """, (
            dados.get('razaoSocial'),
            dados.get('nomeFantasia'),
            dados.get('cnpj'),
            dados.get('email'),
            dados.get('celular'),
            dados.get('cidade'),
            dados.get('estado'),
            dados.get('endereco'),
            dados.get('areaAtuacao'),
            datetime.now(),
            dados.get('senha')
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Empresa criada com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/empresas/<int:id>', methods=['PUT'])
def atualizar_empresa(id):
    try:
        dados = request.get_json()
        
        cursor.execute("""
            UPDATE Empresa 
            SET UsuarioID = ?, RazaoSocial = ?, NomeFantasia = ?, CNPJ = ?, Email = ?, 
                Celular = ?, Cidade = ?, Estado = ?, Endereco = ?, AreaAtuacao = ?, Senha = ?
            WHERE ID = ?
        """, (
            dados.get('razaoSocial'),
            dados.get('nomeFantasia'),
            dados.get('cnpj'),
            dados.get('email'),
            dados.get('celular'),
            dados.get('cidade'),
            dados.get('estado'),
            dados.get('endereco'),
            dados.get('areaAtuacao'),
            dados.get('senha'),
            id
        ))
        conexao.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Empresa não encontrada"}), 404
        
        return jsonify({"mensagem": "Empresa atualizada com sucesso"}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/empresas/<int:id>', methods=['DELETE'])
def deletar_empresa(id):
    try:
        cursor.execute("DELETE FROM Empresa WHERE ID = ?", id)
        conexao.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Empresa não encontrada"}), 404
        
        return jsonify({"mensagem": "Empresa deletada com sucesso"}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/confirmacoes-empresa', methods=['GET'])
def obter_confirmacoes_empresa():
    try:
        cursor.execute("SELECT * FROM ConfirmacaoEmpresa ORDER BY ID")
        confirmacoes = cursor.fetchall()
        
        resultado = []
        for conf in confirmacoes:
            resultado.append({
                "id": conf[0],
                "empresaID": conf[1],
                "nomeConfirmacao": conf[2],
                "dataConfirmacao": str(conf[3]) if conf[3] else None
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/confirmacoes-empresa/<int:id>', methods=['GET'])
def obter_confirmacao_empresa(id):
    try:
        cursor.execute("SELECT * FROM ConfirmacaoEmpresa WHERE ID = ?", id)
        conf = cursor.fetchone()
        
        if not conf:
            return jsonify({"erro": "Confirmação não encontrada"}), 404
        
        return jsonify({
            "id": conf[0],
            "empresaID": conf[1],
            "nomeConfirmacao": conf[2],
            "dataConfirmacao": str(conf[3]) if conf[3] else None
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/confirmacoes-empresa', methods=['POST'])
def criar_confirmacao_empresa():
    try:
        dados = request.get_json()
        
        cursor.execute("""
            INSERT INTO ConfirmacaoEmpresa (EmpresaID, NomeConfirmacao, DataConfirmacao)
            VALUES (?, ?, ?)
        """, (
            dados.get('empresaID'),
            dados.get('nomeConfirmacao'),
            datetime.now()
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Confirmação criada com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500



@app.route('/propostas', methods=['GET'])
def obter_propostas():
    try:
        cursor.execute("SELECT * FROM Proposta ORDER BY ID")
        propostas = cursor.fetchall()
        
        resultado = []
        for prop in propostas:
            resultado.append({
                "id": prop[0],
                "desafioID": prop[1],
                "instituicaoID": prop[2],
                "titulo": prop[3],
                "descricao": prop[4],
                "nomeArquivo": prop[5],
                "arquivo": prop[6],
                "dataEnvio": str(prop[7]) if prop[7] else None
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/propostas/<int:id>', methods=['GET'])
def obter_proposta(id):
    try:
        cursor.execute("SELECT * FROM Proposta WHERE ID = ?", id)
        prop = cursor.fetchone()
        
        if not prop:
            return jsonify({"erro": "Proposta não encontrada"}), 404
        
        return jsonify({
            "id": prop[0],
            "desafioID": prop[1],
            "instituicaoID": prop[2],
            "titulo": prop[3],
            "descricao": prop[4],
            "nomeArquivo": prop[5],
            "arquivo": prop[6],
            "dataEnvio": str(prop[7]) if prop[7] else None
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/propostas', methods=['POST'])
def criar_proposta():
    try:
        dados = request.get_json()
        
        cursor.execute("""
            INSERT INTO Proposta (DesafioID, InstituicaoID, Titulo, Descricao, NomeArquivo, Arquivo, DataEnvio)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            dados.get('desafioID'),
            dados.get('instituicaoID'),
            dados.get('titulo'),
            dados.get('descricao'),
            dados.get('nomeArquivo'),
            dados.get('arquivo'),
            datetime.now()
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Proposta criada com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500



@app.route('/desafios/completo', methods=['GET'])
def obter_desafios_completo():
    """Retorna desafios com dados da empresa"""
    try:
        cursor.execute("""
            SELECT 
                d.ID, d.Titulo, d.Descricao, d.AreaConhecimento,
                d.NivelProblema, d.StatusDesafio, d.DataCriacao, d.DataLimite,
                e.ID as empresaID, e.NomeFantasia as empresaNome
            FROM Desafio d
            LEFT JOIN Empresa e ON d.EmpresaID = e.ID
            ORDER BY d.DataCriacao DESC
        """)
        desafios = cursor.fetchall()
        
        resultado = []
        for des in desafios:
            resultado.append({
                "id": des[0],
                "titulo": des[1],
                "descricao": des[2],
                "areaConhecimento": des[3],
                "nivelProblema": des[4],
                "statusDesafio": des[5],
                "dataCriacao": str(des[6]) if des[6] else None,
                "dataLimite": str(des[7]) if des[7] else None,
                "empresa": {
                    "id": des[8],
                    "nome": des[9]
                } if des[8] else None
            })
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Erro ao obter desafios completo: {e}")
        return jsonify({"erro": str(e)}), 500


@app.route('/desafios', methods=['GET'])
def obter_desafios():
    try:
        cursor.execute("SELECT * FROM Desafio ORDER BY ID")
        desafios = cursor.fetchall()
        
        resultado = []
        for des in desafios:
            resultado.append({
                "id": des[0],
                "empresaID": des[1],
                "titulo": des[2],
                "descricao": des[3],
                "areaConhecimento": des[4],
                "nivelProblema": des[5],
                "statusDesafio": des[6],
                "dataCriacao": str(des[7]) if des[7] else None,
                "dataLimite": str(des[8]) if des[8] else None
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/desafios/<int:id>', methods=['GET'])
def obter_desafio(id):
    """Retorna desafio completo com requisitos e propostas"""
    try:
        # Buscar desafio
        cursor.execute("""
            SELECT d.*, e.NomeFantasia as empresaNome
            FROM Desafio d
            LEFT JOIN Empresa e ON d.EmpresaID = e.ID
            WHERE d.ID = ?
        """, (id,))
        des = cursor.fetchone()
        
        if not des:
            return jsonify({"erro": "Desafio não encontrado"}), 404
        
        # Buscar requisitos
        cursor.execute("""
            SELECT ID, Descricao FROM Requisito WHERE DesafioID = ?
        """, (id,))
        requisitos = cursor.fetchall()
        
        # Buscar propostas
        cursor.execute("""
            SELECT p.ID, p.Titulo, p.DataEnvio, i.NomeInstituicao
            FROM Proposta p
            LEFT JOIN Instituicao i ON p.InstituicaoID = i.ID
            WHERE p.DesafioID = ?
            ORDER BY p.DataEnvio DESC
        """, (id,))
        propostas = cursor.fetchall()
        
        resultado = {
            "id": des[0],
            "empresaID": des[1],
            "titulo": des[2],
            "descricao": des[3],
            "areaConhecimento": des[4],
            "nivelProblema": des[5],
            "statusDesafio": des[6],
            "dataCriacao": str(des[7]) if des[7] else None,
            "dataLimite": str(des[8]) if des[8] else None,
            "empresaNome": des[9] if len(des) > 9 else None,
            "requisitos": [{"id": r[0], "descricao": r[1]} for r in requisitos],
            "propostas": [{"id": p[0], "titulo": p[1], "dataEnvio": str(p[2]) if p[2] else None, "instituicao": p[3]} for p in propostas]
        }
        
        return jsonify(resultado), 200
    except Exception as e:
        print(f"Erro ao obter desafio {id}: {e}")
        return jsonify({"erro": str(e)}), 500


@app.route('/desafios', methods=['POST'])
def criar_desafio():
    try:
        dados = request.get_json()
        
        cursor.execute("""
            INSERT INTO Desafio (EmpresaID, Titulo, Descricao, AreaConhecimento, NivelProblema, StatusDesafio, DataCriacao, DataLimite)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dados.get('empresaID'),
            dados.get('titulo'),
            dados.get('descricao'),
            dados.get('areaConhecimento'),
            dados.get('nivelProblema'),
            dados.get('statusDesafio'),
            datetime.now(),
            dados.get('dataLimite')
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Desafio criado com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/desafios/<int:id>', methods=['PUT'])
def atualizar_desafio(id):
    try:
        dados = request.get_json()
        
        cursor.execute("""
            UPDATE Desafio 
            SET EmpresaID = ?, Titulo = ?, Descricao = ?, AreaConhecimento = ?, 
                NivelProblema = ?, StatusDesafio = ?, DataLimite = ?
            WHERE ID = ?
        """, (
            dados.get('empresaID'),
            dados.get('titulo'),
            dados.get('descricao'),
            dados.get('areaConhecimento'),
            dados.get('nivelProblema'),
            dados.get('statusDesafio'),
            dados.get('dataLimite'),
            id
        ))
        conexao.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Desafio não encontrado"}), 404
        
        return jsonify({"mensagem": "Desafio atualizado com sucesso"}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/desafios/<int:id>', methods=['DELETE'])
def deletar_desafio(id):
    try:
        cursor.execute("DELETE FROM Desafio WHERE ID = ?", id)
        conexao.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Desafio não encontrado"}), 404
        
        return jsonify({"mensagem": "Desafio deletado com sucesso"}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500



@app.route('/requisitos', methods=['GET'])
def obter_requisitos():
    try:
        cursor.execute("SELECT * FROM Requisito ORDER BY ID")
        requisitos = cursor.fetchall()
        
        resultado = []
        for req in requisitos:
            resultado.append({
                "id": req[0],
                "desafioID": req[1],
                "descricao": req[2]
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/requisitos/<int:id>', methods=['GET'])
def obter_requisito(id):
    try:
        cursor.execute("SELECT * FROM Requisito WHERE ID = ?", id)
        req = cursor.fetchone()
        
        if not req:
            return jsonify({"erro": "Requisito não encontrado"}), 404
        
        return jsonify({
            "id": req[0],
            "desafioID": req[1],
            "descricao": req[2]
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/requisitos', methods=['POST'])
def criar_requisito():
    try:
        dados = request.get_json()
        
        cursor.execute("""
            INSERT INTO Requisito (DesafioID, Descricao)
            VALUES (?, ?)
        """, (
            dados.get('desafioID'),
            dados.get('descricao')
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Requisito criado com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/detalhes-desafio', methods=['GET'])
def obter_detalhes_desafio():
    try:
        cursor.execute("SELECT * FROM DetalheDesafio ORDER BY ID")
        detalhes = cursor.fetchall()
        
        resultado = []
        for detalhe in detalhes:
            resultado.append({
                "id": detalhe[0],
                "desafioID": detalhe[1],
                "requisitoID": detalhe[2]
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/detalhes-desafio/<int:id>', methods=['GET'])
def obter_detalhe_desafio(id):
    try:
        cursor.execute("SELECT * FROM DetalheDesafio WHERE ID = ?", id)
        detalhe = cursor.fetchone()
        
        if not detalhe:
            return jsonify({"erro": "Detalhe não encontrado"}), 404
        
        return jsonify({
            "id": detalhe[0],
            "desafioID": detalhe[1],
            "requisitoID": detalhe[2]
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/detalhes-desafio', methods=['POST'])
def criar_detalhe_desafio():
    try:
        dados = request.get_json()
        
        cursor.execute("""
            INSERT INTO DetalheDesafio (DesafioID, RequisitoID)
            VALUES (?, ?)
        """, (
            dados.get('desafioID'),
            dados.get('requisitoID')
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Detalhe do desafio criado com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500



@app.route('/notificacoes', methods=['GET'])
def obter_notificacoes():
    try:
        cursor.execute("SELECT * FROM Notificacao ORDER BY ID")
        notificacoes = cursor.fetchall()
        
        resultado = []
        for notif in notificacoes:
            resultado.append({
                "id": notif[0],
                "desafioID": notif[1],
                "descricao": notif[2],
                "lista": notif[3],
                "dataNotificacao": str(notif[4]) if notif[4] else None
            })
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/notificacoes/<int:id>', methods=['GET'])
def obter_notificacao(id):
    try:
        cursor.execute("SELECT * FROM Notificacao WHERE ID = ?", id)
        notif = cursor.fetchone()
        
        if not notif:
            return jsonify({"erro": "Notificação não encontrada"}), 404
        
        return jsonify({
            "id": notif[0],
            "desafioID": notif[1],
            "descricao": notif[2],
            "lista": notif[3],
            "dataNotificacao": str(notif[4]) if notif[4] else None
        }), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/notificacoes', methods=['POST'])
def criar_notificacao():
    try:
        dados = request.get_json()
        
        cursor.execute("""
            INSERT INTO Notificacao (DesafioID, Descricao, Lista, DataNotificacao)
            VALUES (?, ?, ?, ?)
        """, (
            dados.get('desafioID'),
            dados.get('descricao'),
            dados.get('lista'),
            datetime.now()
        ))
        conexao.commit()
        
        return jsonify({"mensagem": "Notificação criada com sucesso"}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.route('/notificacoes/<int:id>', methods=['DELETE'])
def deletar_notificacao(id):
    try:
        cursor.execute("DELETE FROM Notificacao WHERE ID = ?", id)
        conexao.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"erro": "Notificação não encontrada"}), 404
        
        return jsonify({"mensagem": "Notificação deletada com sucesso"}), 200
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({"erro": "Rota não encontrada"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"erro": "Erro interno do servidor"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

input("Pressione Enter para encerrar a aplicação...")