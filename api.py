from flask import Flask, jsonify, request # type: ignore
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
from flask_jwt_extended import ( # type: ignore
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from dotenv import load_dotenv # type: ignore

import psycopg2
import psycopg2.extras
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

app = Flask(__name__)

app.config['JSON_SORT_KEYS'] = False
app.config["JWT_SECRET_KEY"] = "sua_chave_super_secreta"

jwt = JWTManager(app)


def get_connection():
    return psycopg2.connect(DATABASE_URL)


@app.route('/')
def index():
    return "Bem-vindo à API do Sistema CDL!"


# =========================
# LOGIN
# =========================

@app.route('/login', methods=['POST'])
def login():

    try:

        dados = request.get_json()

        email = dados['email']
        senha = dados['senha']

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT id, senha
            FROM usuario
            WHERE email = %s
        """, (email,))

        usuario = cursor.fetchone()

        cursor.close()
        conexao.close()

        if usuario:

            if check_password_hash(usuario["senha"], senha):

                token = create_access_token(
                    identity=str(usuario["id"])
                )

                return jsonify({
                    "mensagem": "Login realizado",
                    "token": token
                }), 200

        return jsonify({
            "erro": "Email ou senha inválidos"
        }), 401

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

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT
                id,
                nome,
                email,
                tipousuario
            FROM usuario
            WHERE id = %s
        """, (usuario_id,))

        usuario = cursor.fetchone()

        cursor.close()
        conexao.close()

        if usuario is None:

            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        return jsonify(usuario), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


# =========================
# USUARIOS
# =========================

@app.route('/usuarios', methods=['GET'])
def obter_usuarios():

    try:

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM usuario
            ORDER BY id
        """)

        usuarios = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(usuarios), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios/<int:id>', methods=['GET'])
def obter_usuario(id):

    try:

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM usuario
            WHERE id = %s
        """, (id,))

        usuario = cursor.fetchone()

        cursor.close()
        conexao.close()

        if not usuario:

            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        return jsonify(usuario), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios', methods=['POST'])
def criar_usuario():

    try:

        dados = request.get_json()

        nome = dados['nome']
        email = dados['email']
        senha = dados['senha']

        senha_hash = generate_password_hash(senha)

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO usuario
            (
                nome,
                email,
                senha,
                tipousuario,
                datacadastro,
                ativo
            )
            VALUES (%s, %s, %s, %s, NOW(), %s)
        """, (
            nome,
            email,
            senha_hash,
            'Usuario',
            True
        ))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Usuário criado com sucesso"
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios/<int:id>', methods=['PUT'])
def atualizar_usuario(id):

    try:

        dados = request.get_json()

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            UPDATE usuario
            SET
                nome = %s,
                email = %s,
                senha = %s,
                tipousuario = %s,
                ativo = %s
            WHERE id = %s
        """, (
            dados.get('nome'),
            dados.get('email'),
            dados.get('senha'),
            dados.get('tipousuario'),
            dados.get('ativo'),
            id
        ))

        conexao.commit()

        linhas = cursor.rowcount

        cursor.close()
        conexao.close()

        if linhas == 0:

            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        return jsonify({
            "mensagem": "Usuário atualizado com sucesso"
        }), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):

    try:

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            DELETE FROM usuario
            WHERE id = %s
        """, (id,))

        conexao.commit()

        linhas = cursor.rowcount

        cursor.close()
        conexao.close()

        if linhas == 0:

            return jsonify({
                "erro": "Usuário não encontrado"
            }), 404

        return jsonify({
            "mensagem": "Usuário deletado com sucesso"
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

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM empresa
            ORDER BY id
        """)

        empresas = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(empresas), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/empresas', methods=['POST'])
def criar_empresa():

    try:

        dados = request.get_json()

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO empresa
            (
                razaosocial,
                nomefantasia,
                cnpj,
                email,
                celular,
                cidade,
                estado,
                endereco,
                areaatuacao,
                datacadastro,
                senha
            )
            VALUES
            (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                NOW(),
                %s
            )
        """, (
            dados.get('razaosocial'),
            dados.get('nomefantasia'),
            dados.get('cnpj'),
            dados.get('email'),
            dados.get('celular'),
            dados.get('cidade'),
            dados.get('estado'),
            dados.get('endereco'),
            dados.get('areaatuacao'),
            dados.get('senha')
        ))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Empresa criada com sucesso"
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


# =========================
# INSTITUICOES
# =========================

@app.route('/instituicoes', methods=['GET'])
def obter_instituicoes():

    try:

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM instituicao
            ORDER BY id
        """)

        instituicoes = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(instituicoes), 200

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

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO instituicao
            (
                nomeinstituicao,
                cnpj,
                email,
                celular,
                cidade,
                estado,
                endereco,
                datacadastro,
                senha
            )
            VALUES
            (
                %s, %s, %s, %s,
                %s, %s, %s,
                NOW(),
                %s
            )
        """, (
            dados.get('nomeinstituicao'),
            dados.get('cnpj'),
            dados.get('email'),
            dados.get('celular'),
            dados.get('cidade'),
            dados.get('estado'),
            dados.get('endereco'),
            senha_hash
        ))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Instituição criada com sucesso"
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

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM desafio
            ORDER BY id
        """)

        desafios = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(desafios), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/desafios', methods=['POST'])
def criar_desafio():

    try:

        dados = request.get_json()

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO desafio
            (
                empesaid,
                titulo,
                descricao,
                areaconhecimento,
                nivelproblema,
                statusdesafio,
                datacriacao,
                datalimite
            )
            VALUES
            (
                %s, %s, %s, %s,
                %s, %s,
                NOW(),
                %s
            )
        """, (
            dados.get('empresaid'),
            dados.get('titulo'),
            dados.get('descricao'),
            dados.get('areaconhecimento'),
            dados.get('nivelproblema'),
            dados.get('statusdesafio'),
            dados.get('datalimite')
        ))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Desafio criado com sucesso"
        }), 201

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

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM proposta
            ORDER BY id
        """)

        propostas = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(propostas), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/propostas', methods=['POST'])
def criar_proposta():

    try:

        dados = request.get_json()

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO proposta
            (
                desafioid,
                instituicaoid,
                titulo,
                descricao,
                nomearquivo,
                arquivo,
                dataenvio
            )
            VALUES
            (
                %s, %s, %s,
                %s, %s, %s,
                NOW()
            )
        """, (
            dados.get('desafioid'),
            dados.get('instituicaoid'),
            dados.get('titulo'),
            dados.get('descricao'),
            dados.get('nomearquivo'),
            dados.get('arquivo')
        ))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Proposta criada com sucesso"
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

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM requisito
            ORDER BY id
        """)

        requisitos = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(requisitos), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/requisitos', methods=['POST'])
def criar_requisito():

    try:

        dados = request.get_json()

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO requisito
            (
                desafioid,
                descricao
            )
            VALUES
            (
                %s,
                %s
            )
        """, (
            dados.get('desafioid'),
            dados.get('descricao')
        ))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Requisito criado com sucesso"
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


# =========================
# NOTIFICACOES
# =========================

@app.route('/notificacoes', methods=['GET'])
def obter_notificacoes():

    try:

        conexao = get_connection()

        cursor = conexao.cursor(
            cursor_factory=psycopg2.extras.RealDictCursor
        )

        cursor.execute("""
            SELECT *
            FROM notificacao
            ORDER BY id
        """)

        notificacoes = cursor.fetchall()

        cursor.close()
        conexao.close()

        return jsonify(notificacoes), 200

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


@app.route('/notificacoes', methods=['POST'])
def criar_notificacao():

    try:

        dados = request.get_json()

        conexao = get_connection()

        cursor = conexao.cursor()

        cursor.execute("""
            INSERT INTO notificacao
            (
                desafioid,
                descricao,
                lista,
                datanotificacao
            )
            VALUES
            (
                %s,
                %s,
                %s,
                NOW()
            )
        """, (
            dados.get('desafioid'),
            dados.get('descricao'),
            dados.get('lista')
        ))

        conexao.commit()

        cursor.close()
        conexao.close()

        return jsonify({
            "mensagem": "Notificação criada com sucesso"
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


# =========================
# ERROR HANDLERS
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
# START
# =========================

if __name__ == '__main__':

    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000
    )