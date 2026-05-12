# Teste de Login - Sistema CDL

## Como testar o login

### Pré-requisitos
- SQL Server rodando com o banco `SistemaCDL`
- Python com Flask, pyodbc e outras dependências instaladas
- API rodando em `http://localhost:5000`

### 1. Verificar status da API e banco de dados

Abra seu navegador e acesse:
```
http://localhost:5000/api/debug/status
```

Você verá uma resposta como:
```json
{
  "api": "online",
  "database": "online",
  "users_count": 2,
  "users": [
    { "id": 1, "email": "empresa@test.com" },
    { "id": 2, "email": "instituicao@test.com" }
  ]
}
```

Se `database` for `"offline"`, o banco não está acessível. Verifique:
- SQL Server está rodando?
- Credenciais em `Back/api.py` estão corretas?
- O banco `SistemaCDL` existe?

### 2. Criar um usuário de teste (SQL Server)

Se não houver usuários, execute este script no SQL Server Management Studio:

```sql
-- Criar usuário de teste
INSERT INTO Usuario (Nome, Email, Senha, TipoUsuario, DataCadastro, Ativo)
VALUES (
    'Usuário Teste',
    'teste@example.com',
    'senha_hash_aqui',  -- veja nota abaixo
    'empresa',
    GETDATE(),
    1
);
```

**Nota sobre a senha**: A senha deve estar em formato hash. Para testar rapidamente, você pode:

1. **Opção A** (Recomendado - usar endpoint para criar usuário com senha em texto):
   - Implementar endpoint POST `/usuarios/register` que aceita email e senha em texto
   - O endpoint vai fazer o hash automaticamente (veja "Passo 3" abaixo)

2. **Opção B** (Teste manual):
   - Abra Python e gere um hash:
   ```python
   from werkzeug.security import generate_password_hash
   hash_senha = generate_password_hash('senha123')
   print(hash_senha)
   ```
   - Use este hash no INSERT acima

### 3. Testar login pela interface

1. Abra `http://localhost:5000/login.html` no navegador
2. Digite um email e senha de um usuário criado
3. Clique em "Entrar"
4. Se bem-sucedido, será redirecionado para `tela-inicial-desafios.html`
5. Se falhar, verá um alert com a mensagem de erro

### 4. Verificar console de erros

Se algo não funciona:

1. Abra o DevTools (F12) → Aba "Console"
2. Procure por erros em vermelho
3. Verifique também a aba "Network" para ver requisições ao API

### 5. Criar endpoint de registro (opcional)

Se quiser facilitar o teste, adicione isto em `Back/api.py` depois do `/login`:

```python
@app.route('/usuarios/register', methods=['POST'])
def register_user():
    """Register a new user (development/test only)"""
    try:
        dados = request.get_json()
        email = dados.get('email', '').strip()
        senha = dados.get('senha', '').strip()
        nome = dados.get('nome', 'Novo Usuário')
        tipo = dados.get('tipo', 'instituicao')
        
        if not email or not senha:
            return jsonify({"erro": "Email e senha obrigatórios"}), 400
        
        # Hash da senha
        senha_hash = generate_password_hash(senha)
        
        # Inserir usuário
        cursor.execute("""
            INSERT INTO Usuario (Nome, Email, Senha, TipoUsuario, DataCadastro, Ativo)
            VALUES (?, ?, ?, ?, GETDATE(), 1)
        """, (nome, email, senha_hash, tipo))
        conexao.commit()
        
        return jsonify({"mensagem": "Usuário criado com sucesso", "email": email}), 201
    except Exception as e:
        conexao.rollback()
        return jsonify({"erro": str(e)}), 500
```

Depois, para criar um usuário, POST para:
```
http://localhost:5000/usuarios/register
```

Com body:
```json
{
  "email": "teste@example.com",
  "senha": "senha123",
  "nome": "Usuário Teste",
  "tipo": "instituicao"
}
```

## Fluxo de login esperado

1. Usuário acessa `http://localhost:5000/login.html`
2. Preenche email e senha
3. Clica em "Entrar"
4. JavaScript envia POST para `http://localhost:5000/login`
5. API valida credenciais no banco
6. Se válido: retorna JWT token → armazena no localStorage → redireciona para `tela-inicial-desafios.html`
7. Se inválido: mostra alert com erro

## Debug

Se o login não funcionar:

1. **Verifique conexão ao banco**:
   ```
   GET http://localhost:5000/api/debug/status
   ```

2. **Verifique usuário existe**:
   - Veja resposta acima, campo `users`

3. **Teste manual via cURL**:
   ```bash
   curl -X POST http://localhost:5000/login \
     -H "Content-Type: application/json" \
     -d '{"email":"teste@example.com","senha":"senha123"}'
   ```

4. **Verifique console da API**:
   - Terminal onde `python Back/api.py` está rodando deve mostrar logs

---

**Status atual**: Login configurado para redirecionar para `tela-inicial-desafios.html` após autenticação bem-sucedida.
