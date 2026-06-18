from flask import Flask, jsonify, request  # type: ignore
from flask_cors import CORS  # type: ignore
from flask_jwt_extended import (  # type: ignore
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request,
    get_jwt
)
from dotenv import load_dotenv  # type: ignore
from supabase import create_client, Client  # type: ignore
from werkzeug.utils import secure_filename # type: ignore
import bcrypt  # type: ignore
import os

load_dotenv()

app = Flask(__name__)

CORS(app)

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "sua_chave_super_secreta")
app.config["JSON_SORT_KEYS"] = False

jwt = JWTManager(app)
 

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


SERVER_AUTH_ENABLED = os.getenv('SERVER_AUTH_ENABLED', 'false').lower() == 'true'
AUTH_ROLE_IN_TOKEN = os.getenv('AUTH_ROLE_IN_TOKEN', 'true').lower() == 'true'

 

@app.route('/upload-arquivo', methods=['POST'])
@jwt_required()
def upload_arquivo():

    try:

        if 'arquivo' not in request.files:

            return jsonify({
                "erro": "Nenhum arquivo enviado"
            }), 400

        arquivo = request.files['arquivo']

        if arquivo.filename == '':

            return jsonify({
                "erro": "Arquivo inválido"
            }), 400

        nome_original = secure_filename(arquivo.filename)

        extensao = nome_original.split('.')[-1].lower()

        if extensao != 'zip':

            return jsonify({
                "erro": "Apenas arquivos ZIP são permitidos"
            }), 400

        nome_arquivo = secure_filename(arquivo.filename)

        caminho = f"propostas/{nome_arquivo}"


        response = supabase.storage.from_("arquivos").upload(
            path=caminho,
            file=arquivo.read(),
            file_options={
                "content-type": "application/zip"
            }
        )

        url = supabase.storage.from_("arquivos").get_public_url(caminho)

        return jsonify({

            "mensagem": "Arquivo enviado com sucesso",
            "arquivo": {
                "nome_original": nome_original,
                "nome_storage": nome_arquivo,
                "caminho": caminho,
                "url": url
            }

        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

 

@app.route('/')
def index():

    return jsonify({
        "mensagem": "Bem-vindo à API do Sistema CDL!"
    })



@app.route('/login', methods=['POST'])
def login():
    try:
        

        dados = request.get_json()
        email = dados.get('email')
        senha = dados.get('senha')

        usuario_encontrado = None
        tipo_usuario = None
        tabela_origem = None
        dados_completos = None

        # VERIFICAR PRIMEIRO NA TABELA INSTITUICAO
        response_instituicao = supabase.table("instituicao").select("*").eq("email", email).execute()
        if len(response_instituicao.data) > 0:
            instituicao = response_instituicao.data[0]
            if verificar_senha(senha, instituicao["senha"]):
                status_inst = str(instituicao.get("status", "aprovado")).lower()
                if status_inst == "pendente":
                    return jsonify({"erro": "Cadastro pendente de aprovação pelo administrador."}), 403
                if status_inst == "rejeitado" or status_inst == "reprovado":
                    return jsonify({"erro": "Cadastro rejeitado. Entre em contato com o administrador."}), 403
                usuario_encontrado = instituicao
                dados_completos = {
                    "id": instituicao["id"],
                    "email": instituicao["email"],
                    "nomeinstituicao": instituicao.get("nomeinstituicao"),
                    "cnpj": instituicao.get("cnpj"),
                    "celular": instituicao.get("celular"),
                    "cidade": instituicao.get("cidade"),
                    "estado": instituicao.get("estado"),
                    "endereco": instituicao.get("endereco"),
                    "sourceTable": "instituicoes",
                    "tipo": "instituicao"
                }
                tipo_usuario = "instituicao"
                tabela_origem = "instituicoes"

        # DEPOIS VERIFICAR NA TABELA EMPRESA
        if usuario_encontrado is None:
            response_empresa = supabase.table("empresa").select("*").eq("email", email).execute()
            if len(response_empresa.data) > 0:
                empresa = response_empresa.data[0]
                if verificar_senha(senha, empresa["senha"]):
                    status_emp = str(empresa.get("status", "aprovado")).lower()
                    if status_emp == "pendente":
                        return jsonify({"erro": "Cadastro pendente de aprovação pelo administrador."}), 403
                    if status_emp == "rejeitado" or status_emp == "reprovado":
                        return jsonify({"erro": "Cadastro rejeitado. Entre em contato com o administrador."}), 403
                    usuario_encontrado = empresa
                    dados_completos = {
                        "id": empresa["id"],
                        "email": empresa["email"],
                        "nomefantasia": empresa.get("nomefantasia"),
                        "razaosocial": empresa.get("razaosocial"),
                        "cnpj": empresa.get("cnpj"),
                        "celular": empresa.get("celular"),
                        "cidade": empresa.get("cidade"),
                        "estado": empresa.get("estado"),
                        "endereco": empresa.get("endereco"),
                        "areaatuacao": empresa.get("areaatuacao"),
                        "sourceTable": "empresas",
                        "tipo": "empresa"
                    }
                    tipo_usuario = "empresa"
                    tabela_origem = "empresas"

        # DEPOIS VERIFICAR NA TABELA USUARIO
        if usuario_encontrado is None:
            response_usuario = supabase.table("usuario").select("*").eq("email", email).execute()
            if len(response_usuario.data) > 0:
                usuario = response_usuario.data[0]
                if verificar_senha(senha, usuario["senha"]):
                    usuario_encontrado = usuario
                    
                    tipo_banco = usuario.get("tipousuario") or usuario.get("tipo", "coordenador")
                    
                    tipo_banco_str = str(tipo_banco).lower()
                    if tipo_banco_str in ("admin", "administrador"):
                        tipo_normalizado = "admin"
                    else:
                        tipo_normalizado = "coordenador"
                    
                    dados_completos = {
                        "id": usuario["id"],
                        "email": usuario["email"],
                        "nome": usuario.get("nome"),
                        "sourceTable": "usuarios",
                        "tipo": tipo_normalizado
                    }
                    tipo_usuario = tipo_normalizado
                    tabela_origem = "usuarios"

        if usuario_encontrado is None:
            return jsonify({"erro": "Email ou senha inválidos"}), 401

        token = create_access_token(
            identity=str(usuario_encontrado["id"]),
            additional_claims={"role": tipo_usuario, "sourceTable": tabela_origem}
        )

        return jsonify({
            "mensagem": "Login realizado com sucesso",
            "token": token,
            "usuario": dados_completos
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/me', methods=['GET'])
@jwt_required()
def me():

    try:

        usuario_id = get_jwt_identity()
        response = supabase.table("usuario") \
            .select("id, nome, email, tipousuario") \
            .eq("id", usuario_id) \
            .execute()

        usuarios = response.data

        if len(usuarios) == 0:

            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        return jsonify(usuarios[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

def require_roles(*allowed_roles):
    def decorator(fn):
        def wrapper(*args, **kwargs):

            if not SERVER_AUTH_ENABLED:
                return fn(*args, **kwargs)

            try:
                verify_jwt_in_request()
            except Exception:
                return jsonify({"erro": "Token ausente ou inválido"}), 401
            role = None

            try:
                if AUTH_ROLE_IN_TOKEN:

                    claims = get_jwt() or {}
                    role = (claims.get('role') or '').lower()

                else:

                    usuario_id = get_jwt_identity()

                    resp = supabase.table('usuario') \
                        .select('tipousuario') \
                        .eq('id', usuario_id) \
                        .execute()

                    data = resp.data

                    if data and len(data) > 0:
                        role = (data[0].get('tipousuario') or '').lower()

            except Exception:
                role = None

            if role and role == 'admin':
                return fn(*args, **kwargs)

            allowed = [r.lower() for r in allowed_roles]

            if not role or role not in allowed:
                return jsonify({"erro": "Acesso negado"}), 403

            return fn(*args, **kwargs)

        wrapper.__name__ = fn.__name__
        return wrapper

    return decorator


@app.route('/access-control', methods=['GET'])
def access_control():
    try:
        import json, os
        path = os.path.join(os.path.dirname(__file__), 'access_control.json')
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

 
@app.route('/me/desafios', methods=['GET'])
@jwt_required()
def meus_desafios():

    try:

        claims = get_jwt() or {}
        source_table = (claims.get('sourceTable') or '').lower()
        usuario_id = get_jwt_identity()

        empresa_id = None

        if source_table == 'empresas':
            empresa_id = int(usuario_id)
        else:
            response_empresa = supabase.table("empresa") \
                .select("id") \
                .eq("usuarioid", usuario_id) \
                .execute()
            empresas = response_empresa.data
            if empresas:
                empresa_id = empresas[0]["id"]

        if not empresa_id:
            return jsonify([]), 200

        response_desafios = supabase.table("desafio") \
            .select("*") \
            .eq("empresaid", empresa_id) \
            .order("id") \
            .execute()

        return jsonify(response_desafios.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500



@app.route('/usuarios', methods=['GET'])
def obter_usuarios():

    try:

        response = supabase.table("usuario") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios/<int:id>', methods=['GET'])
def obter_usuario(id):

    try:

        response = supabase.table("usuario") \
            .select("*") \
            .eq("id", id) \
            .execute()

        usuarios = response.data

        if len(usuarios) == 0:

            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        return jsonify(usuarios[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios', methods=['POST'])
def criar_usuario():

    try:

        dados = request.get_json()
        novo_usuario = {
            "nome": dados.get('nome'),
            "email": dados.get('email'),
            "senha": gerar_hash(dados.get('senha')),
            "tipousuario": dados.get('tipousuario'),
            "instituicao": dados.get('instituicao'),
            
            "ativo": True
        }

        response = supabase.table("usuario") \
            .insert(novo_usuario) \
            .execute()

        return jsonify({
            "mensagem": "Usuário criado com sucesso",
            "dados": response.data
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

def gerar_hash(senha):
    return bcrypt.hashpw(
        senha.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')


def verificar_senha(senha, senha_hash):
    return bcrypt.checkpw(
        senha.encode('utf-8'),
        senha_hash.encode('utf-8')
    )

@app.route('/usuarios/<int:id>', methods=['PUT'])
def atualizar_usuario(id):

    try:

        dados = request.get_json()

        dados_atualizados = {
            "nome": dados.get('nome'),
            "email": dados.get('email'),
            "tipousuario": dados.get('tipousuario'),
            "ativo": dados.get('ativo')
        }

        # Se veio senha, aplicar hash
        senha = dados.get('senha')
        if senha:
            dados_atualizados["senha"] = gerar_hash(senha)

        response = supabase.table("usuario") \
            .update(dados_atualizados) \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Usuário atualizado com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):

    try:

        response = supabase.table("usuario") \
            .delete() \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Usuário deletado com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios/recuperar-senha', methods=['POST'])
def recuperar_senha():
    try:
        dados = request.get_json()
        email = dados.get('email') or dados.get('contato')

        if not email:
            return jsonify({"erro": "Email é obrigatório"}), 400

        usuario = None
        tabela = None

        for tbl in ['instituicao', 'empresa', 'usuario']:
            resp = supabase.table(tbl).select('id, email, nome, nomeinstituicao, nomefantasia').eq('email', email).execute()
            if resp.data and len(resp.data) > 0:
                usuario = resp.data[0]
                tabela = tbl
                break

        if not usuario:
            return jsonify({"erro": "Email não encontrado no sistema"}), 404

        import random
        codigo = str(random.randint(100000, 999999))

        return jsonify({
            "mensagem": "Código de recuperação gerado com sucesso",
            "codigo": codigo,
            "email": email,
            "tabela": tabela
        }), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


@app.route('/usuarios/redefinir-senha', methods=['POST'])
def redefinir_senha():
    try:
        dados = request.get_json()
        email = dados.get('email')
        codigo = dados.get('codigo')
        nova_senha = dados.get('nova_senha')

        if not email or not codigo or not nova_senha:
            return jsonify({"erro": "Email, código e nova senha são obrigatórios"}), 400

        if len(nova_senha) < 6:
            return jsonify({"erro": "Senha deve ter no mínimo 6 caracteres"}), 400

        usuario = None
        tabela = None

        for tbl in ['instituicao', 'empresa', 'usuario']:
            resp = supabase.table(tbl).select('*').eq('email', email).execute()
            if resp.data and len(resp.data) > 0:
                usuario = resp.data[0]
                tabela = tbl
                break

        if not usuario:
            return jsonify({"erro": "Email não encontrado"}), 404

        supabase.table(tabela).update({
        "senha": gerar_hash(nova_senha)
        }).eq("id", usuario["id"]).execute()

        return jsonify({"mensagem": "Senha redefinida com sucesso"}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500


 
@app.route('/usuarios/alterar-senha', methods=['POST'])
@jwt_required()
def alterar_senha():
    try:
        dados = request.get_json()
        usuario_id = get_jwt_identity()
        current_password = dados.get('currentPassword')
        new_password = dados.get('newPassword')

        if not current_password or not new_password:
            return jsonify({"erro": "Senha atual e nova senha são obrigatórias"}), 400

        if len(new_password) < 6:
            return jsonify({"erro": "Nova senha deve ter no mínimo 6 caracteres"}), 400

        usuario = None
        tabela = None
        user_data = get_jwt() or {}
        source_table = user_data.get('sourceTable', 'usuarios')

        if source_table == 'instituicoes':
            resp = supabase.table("instituicao").select("*").eq("id", usuario_id).execute()
            if resp.data:
                usuario = resp.data[0]
                tabela = "instituicao"
        elif source_table == 'empresas':
            resp = supabase.table("empresa").select("*").eq("id", usuario_id).execute()
            if resp.data:
                usuario = resp.data[0]
                tabela = "empresa"
        else:
            resp = supabase.table("usuario").select("*").eq("id", usuario_id).execute()
            if resp.data:
                usuario = resp.data[0]
                tabela = "usuario"

            if not usuario:
                for tbl in ['instituicao', 'empresa']:
                    resp = supabase.table(tbl).select("*").eq("id", usuario_id).execute()
                    if resp.data:
                        usuario = resp.data[0]
                        tabela = tbl
                        break

        if not usuario:
            return jsonify({"erro": "Usuário não encontrado"}), 404

        # ✅ Verificar senha atual usando bcrypt (hash)
        if not verificar_senha(current_password, usuario["senha"]):
            return jsonify({"erro": "Senha atual incorreta"}), 401

        # ✅ Salvar nova senha com hash
        supabase.table(tabela).update({"senha": gerar_hash(new_password)}).eq("id", usuario_id).execute()

        return jsonify({"mensagem": "Senha alterada com sucesso"}), 200

    except Exception as e:
        return jsonify({"erro": str(e)}), 500



@app.route('/empresas', methods=['GET'])
def obter_empresas():

    try:

        response = supabase.table("empresa") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/empresas/<int:id>', methods=['GET'])
def obter_empresa(id):

    try:

        response = supabase.table("empresa") \
            .select("*") \
            .eq("id", id) \
            .execute()

        empresas = response.data

        if len(empresas) == 0:

            return jsonify({
                "erro": "Empresa não encontrada"
            }), 404

        return jsonify(empresas[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/empresas', methods=['POST'])
def criar_empresa():

    try:

        dados = request.get_json()

        nova_empresa = {
            "razaosocial": dados.get('razaosocial'),
            "nomefantasia": dados.get('nomefantasia'),
            "cnpj": dados.get('cnpj'),
            "email": dados.get('email'),
            "celular": dados.get('celular'),
            "cidade": dados.get('cidade'),
            "estado": dados.get('estado'),
            "endereco": dados.get('endereco'),
            "areaatuacao": dados.get('areaatuacao'),
            "senha": gerar_hash(dados.get('senha')),
        }

        response = supabase.table("empresa") \
            .insert(nova_empresa) \
            .execute()

        return jsonify({
            "mensagem": "Empresa criada com sucesso",
            "dados": response.data
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/empresas/<int:id>', methods=['PUT'])
def atualizar_empresa(id):

    try:

        dados = request.get_json()

        # Se veio senha, aplicar hash
        if dados.get('senha'):
            dados['senha'] = gerar_hash(dados['senha'])

        response = supabase.table("empresa") \
            .update(dados) \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Empresa atualizada com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/empresas/<int:id>', methods=['DELETE'])
def deletar_empresa(id):

    try:

        response = supabase.table("empresa") \
            .delete() \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Empresa deletada com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

@app.route('/instituicoes', methods=['GET'])
def obter_instituicoes():

    try:

        response = supabase.table("instituicao") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/instituicoes/<int:id>', methods=['GET'])
def obter_instituicao(id):

    try:

        response = supabase.table("instituicao") \
            .select("*") \
            .eq("id", id) \
            .execute()

        instituicoes = response.data

        if len(instituicoes) == 0:

            return jsonify({
                "erro": "Instituição não encontrada"
            }), 404

        return jsonify(instituicoes[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/instituicoes', methods=['POST'])
def criar_instituicao():

    try:

        dados = request.get_json()

        nova_instituicao = {
            "nomeinstituicao": dados.get('nomeinstituicao'),
            "cnpj": dados.get('cnpj'),
            "email": dados.get('email'),
            "celular": dados.get('celular'),
            "cidade": dados.get('cidade'),
            "estado": dados.get('estado'),
            "endereco": dados.get('endereco'),
            "senha": gerar_hash(dados.get('senha')),
        }

        response = supabase.table("instituicao") \
            .insert(nova_instituicao) \
            .execute()

        return jsonify({
            "mensagem": "Instituição criada com sucesso",
            "dados": response.data
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500
 

@app.route('/desafios', methods=['GET'])
def obter_desafios():

    try:

        response = supabase.table("desafio") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/desafios/<int:id>', methods=['GET'])
def obter_desafio(id):

    try:

        response = supabase.table("desafio") \
            .select("*") \
            .eq("id", id) \
            .execute()

        desafios = response.data

        if len(desafios) == 0:

            return jsonify({
                "erro": "Desafio não encontrado"
            }), 404

        return jsonify(desafios[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/desafios', methods=['POST'])
def criar_desafio():

    try:

        dados = request.get_json()

        novo_desafio = {
            "empresaid": dados.get('empresaid'),
            "titulo": dados.get('titulo'),
            "descricao": dados.get('descricao'),
            "areaconhecimento": dados.get('areaconhecimento'),
            "nivelprioridade": dados.get('nivelprioridade'),
            "statusdesafio": dados.get('statusdesafio'),
            "datalimite": dados.get('datalimite')
        }

        response = supabase.table("desafio") \
            .insert(novo_desafio) \
            .execute()

        return jsonify({
            "mensagem": "Desafio criado com sucesso",
            "dados": response.data
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/desafios/<int:id>', methods=['PUT'])
def atualizar_desafio(id):

    try:

        dados = request.get_json()

        response = supabase.table("desafio") \
            .update(dados) \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Desafio atualizado com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/desafios/<int:id>', methods=['DELETE'])
def deletar_desafio(id):

    try:

        response = supabase.table("desafio") \
            .delete() \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Desafio deletado com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500



@app.route('/propostas', methods=['GET'])
def obter_propostas():

    try:

        response = supabase.table("proposta") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/propostas/<int:id>', methods=['GET'])
def obter_proposta(id):

    try:

        response = supabase.table("proposta") \
            .select("*") \
            .eq("id", id) \
            .execute()

        propostas = response.data

        if len(propostas) == 0:

            return jsonify({
                "erro": "Proposta não encontrada"
            }), 404

        return jsonify(propostas[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/propostas', methods=['POST'])
def criar_proposta():

    try:

        dados = request.get_json()

        nova_proposta = {
            "desafioid": dados.get('desafioid'),
            "instituicaoid": dados.get('instituicaoid'),
            "titulo": dados.get('titulo'),
            "descricao": dados.get('descricao'),
            "nomearquivo": dados.get('nomearquivo'),
            "arquivo": dados.get('arquivo')
        }

        response = supabase.table("proposta") \
            .insert(nova_proposta) \
            .execute()

        return jsonify({
            "mensagem": "Proposta criada com sucesso",
            "dados": response.data
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/propostas/<int:id>', methods=['PUT'])
def atualizar_proposta(id):

    try:

        dados = request.get_json()

        response = supabase.table("proposta") \
            .update(dados) \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Proposta atualizada com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/requisitos', methods=['GET'])
def obter_requisitos():

    try:

        response = supabase.table("requisito") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/requisitos/<int:id>', methods=['GET'])
def obter_requisito(id):

    try:

        response = supabase.table("requisito") \
            .select("*") \
            .eq("id", id) \
            .execute()

        requisitos = response.data

        if len(requisitos) == 0:

            return jsonify({
                "erro": "Requisito não encontrado"
            }), 404

        return jsonify(requisitos[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/requisitos', methods=['POST'])
def criar_requisito():

    try:

        dados = request.get_json()

        novo_requisito = {
            "desafioid": dados.get('desafioid'),
            "descricao": dados.get('descricao')
        }

        response = supabase.table("requisito") \
            .insert(novo_requisito) \
            .execute()

        return jsonify({
            "mensagem": "Requisito criado com sucesso",
            "dados": response.data
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/notificacoes', methods=['GET'])
def obter_notificacoes():

    try:

        response = supabase.table("notificacao") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/notificacoes/<int:id>', methods=['GET'])
def obter_notificacao(id):

    try:

        response = supabase.table("notificacao") \
            .select("*") \
            .eq("id", id) \
            .execute()

        notificacoes = response.data

        if len(notificacoes) == 0:

            return jsonify({
                "erro": "Notificação não encontrada"
            }), 404

        return jsonify(notificacoes[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/notificacoes', methods=['POST'])
def criar_notificacao():

    try:

        dados = request.get_json()

        nova_notificacao = {
            "desafioid": dados.get('desafioid'),
            "descricao": dados.get('descricao'),
            "lista": dados.get('lista'),
            "tabelafonte": dados.get('tabelafonte')
        }

        response = supabase.table("notificacao") \
            .insert(nova_notificacao) \
            .execute()

        return jsonify({
            "mensagem": "Notificação criada com sucesso",
            "dados": response.data
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/notificacoes/<int:id>', methods=['DELETE'])
def deletar_notificacao(id):

    try:

        response = supabase.table("notificacao") \
            .delete() \
            .eq("id", id) \
            .execute()

        return jsonify({
            "mensagem": "Notificação deletada com sucesso",
            "dados": response.data
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/confirmacoes-empresa', methods=['GET'])
def obter_confirmacoes_empresa():

    try:

        response = supabase.table("confirmacaoempresa") \
            .select("*") \
            .order("id") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/confirmacoes-empresa/<int:id>', methods=['GET'])
def obter_confirmacao_empresa(id):

    try:

        response = supabase.table("confirmacaoempresa") \
            .select("*") \
            .eq("id", id) \
            .execute()

        confirmacoes = response.data

        if len(confirmacoes) == 0:

            return jsonify({
                "erro": "Confirmação não encontrada"
            }), 404

        return jsonify(confirmacoes[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/confirmacoes-empresa', methods=['POST'])
def criar_confirmacao_empresa():

    try:

        dados = request.get_json()

        nova_confirmacao = {

            "empresaid": dados.get('empresaID'),
            "nomeconfirmacao": dados.get('nomeConfirmacao')

        }

        response = supabase.table("confirmacaoempresa") \
            .insert(nova_confirmacao) \
            .execute()

        return jsonify({

            "mensagem": "Confirmação criada com sucesso",
            "dados": response.data

        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/confirmacoes-empresa/<int:id>', methods=['PUT'])
def atualizar_confirmacao_empresa(id):

    try:

        dados = request.get_json()

        dados_atualizados = {

            "empresaid": dados.get('empresaID'),
            "nomeconfirmacao": dados.get('nomeConfirmacao')

        }

        response = supabase.table("confirmacaoempresa") \
            .update(dados_atualizados) \
            .eq("id", id) \
            .execute()

        return jsonify({

            "mensagem": "Confirmação atualizada com sucesso",
            "dados": response.data

        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/confirmacoes-empresa/<int:id>', methods=['DELETE'])
def deletar_confirmacao_empresa(id):

    try:

        response = supabase.table("confirmacaoempresa") \
            .delete() \
            .eq("id", id) \
            .execute()

        return jsonify({

            "mensagem": "Confirmação deletada com sucesso",
            "dados": response.data

        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500



@app.route('/problemas', methods=['GET'])
def obter_problemas():

    try:

        response = supabase.table("problema") \
            .select("*") \
            .execute()

        return jsonify(response.data), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/problemas/<int:id>', methods=['GET'])
def obter_problema(id):

    try:

        response = supabase.table("problema") \
            .select("*") \
            .eq("id", id) \
            .execute()

        dados = response.data

        if len(dados) == 0:

            return jsonify({
                "erro": "Problema não encontrado"
            }), 404

        return jsonify(dados[0]), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "erro": "Rota não encontrada"
    }), 404


@app.errorhandler(500)
def internal_error(error):

    return jsonify({
        "erro": "Erro interno do servidor"
    }), 500



if __name__ == '__main__':

    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )