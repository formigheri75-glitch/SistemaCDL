from flask import Flask, jsonify, request # type: ignore
from flask_cors import CORS
from flask_jwt_extended import ( # type: ignore
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import ( # type: ignore
    generate_password_hash,
    check_password_hash
)
from dotenv import load_dotenv # type: ignore
from supabase import create_client, Client # type: ignore

import os

# =========================
# CONFIGURAÇÕES
# =========================

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = "sua_chave_super_secreta"
app.config["JSON_SORT_KEYS"] = False

jwt = JWTManager(app)

# =========================
# SUPABASE
# =========================

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)

# =========================
# HOME
# =========================

@app.route('/')
def index():

    return jsonify({
        "mensagem": "Bem-vindo à API do Sistema CDL!"
    })


# =========================
# LOGIN
# =========================

@app.route('/login', methods=['POST'])
def login():

    try:

        dados = request.get_json()

        email = dados.get('email')
        senha = dados.get('senha')

        response = supabase.table("usuario") \
            .select("id, senha") \
            .eq("email", email) \
            .execute()

        usuarios = response.data

        if len(usuarios) == 0:

            return jsonify({
                "erro": "Email ou senha inválidos"
            }), 401

        usuario = usuarios[0]

        if usuario["senha"] != senha:

            return jsonify({
                "erro": "Email ou senha inválidos"
            }), 401

        token = create_access_token(
            identity=str(usuario["id"])
        )

        return jsonify({
            "mensagem": "Login realizado",
            "token": token
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

# =========================
# ME
# =========================

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


# =========================
# USUÁRIOS
# =========================

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

        senha_hash = generate_password_hash(
            dados.get('senha')
        )

        novo_usuario = {
            "nome": dados.get('nome'),
            "email": dados.get('email'),
            "senha": senha_hash,
            "tipousuario": "Usuario",
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

        if dados.get('senha'):

            dados_atualizados["senha"] = generate_password_hash(
                dados.get('senha')
            )

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


# =========================
# EMPRESAS
# =========================

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
            "senha": dados.get('senha')
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


# =========================
# INSTITUIÇÕES
# =========================

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


@app.route('/instituicoes', methods=['POST'])
def criar_instituicao():

    try:

        dados = request.get_json()

        senha_hash = generate_password_hash(
            dados.get('senha')
        )

        nova_instituicao = {
            "nomeinstituicao": dados.get('nomeinstituicao'),
            "cnpj": dados.get('cnpj'),
            "email": dados.get('email'),
            "celular": dados.get('celular'),
            "cidade": dados.get('cidade'),
            "estado": dados.get('estado'),
            "endereco": dados.get('endereco'),
            "senha": senha_hash
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


# =========================
# ERROS
# =========================

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


# =========================
# EXECUÇÃO
# =========================

if __name__ == '__main__':

    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )