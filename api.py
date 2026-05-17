from flask import Flask, jsonify, request  # type: ignore
from flask_cors import CORS  # type: ignore
from flask_jwt_extended import (  # type: ignore
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from dotenv import load_dotenv  # type: ignore
from supabase import create_client, Client  # type: ignore

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
# MEUS DESAFIOS
# =========================

@app.route('/me/desafios', methods=['GET'])
@jwt_required()
def meus_desafios():

    try:

        usuario_id = get_jwt_identity()

        response_empresa = supabase.table("empresa") \
            .select("id") \
            .eq("usuarioid", usuario_id) \
            .execute()

        empresas = response_empresa.data

        if len(empresas) == 0:

            return jsonify([]), 200

        empresa_id = empresas[0]["id"]

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

        novo_usuario = {
            "nome": dados.get('nome'),
            "email": dados.get('email'),
            "senha": dados.get('senha'),
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
            "senha": dados.get('senha'),
            "tipousuario": dados.get('tipousuario'),
            "ativo": dados.get('ativo')
        }

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


@app.route('/empresas/<int:id>', methods=['PUT'])
def atualizar_empresa(id):

    try:

        dados = request.get_json()

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
            "senha": dados.get('senha')
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
# DESAFIOS
# =========================

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
            "nivelproblema": dados.get('nivelproblema'),
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


# =========================
# PROPOSTAS
# =========================

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


# =========================
# REQUISITOS
# =========================

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


# =========================
# NOTIFICAÇÕES
# =========================

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
            "lista": dados.get('lista')
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


# =========================
# CONFIRMAÇÕES EMPRESA
# =========================

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