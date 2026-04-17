# 🔌 INTEGRAÇÃO API - M&P Performance

## 📚 Documentação da API Atual

Este painel foi adaptado para se integrar com a **API Backend hospedada na Vercel** (https://api-catraca-mu.vercel.app/) que usa Firebase Firestore para armazenar dados de alunos.

---

## ⚙️ CONFIGURAÇÃO ATUAL

### URL da API
```
https://api-catraca-mu.vercel.app/
```

---

## 📡 ENDPOINTS DISPONÍVEIS

### 1️⃣ LOGIN (Autenticação)

```http
POST /login
Content-Type: application/json

{
  "usuario": "admin",
  "senha": "1234"
}
```

**Resposta esperada (200 OK):**
```json
{
  "token": "eyJhbGc..."
}
```

---

### 2️⃣ BUSCAR ALUNO POR CPF (CATRACA)

> ⚠️ **Usado pelo sistema CATRACA** — Não requer autenticação!

```http
GET /alunos/cpf/{cpf}
Content-Type: application/json
```

**Parâmetros:**
- `cpf` (string) — CPF do aluno, apenas números (11 dígitos). Ex: `53888059801`

**Resposta esperada (200 OK) — Aluno encontrado:**
```json
{
  "id": 1,
  "nome": "pietro mantuan",
  "cpf": "53888059801",
  "status": true
}
```

**Resposta esperada (404 Not Found) — CPF não cadastrado:**
```json
{
  "message": "Aluno não encontrado!"
}
```

**Lógica da CATRACA com base no `status`:**

| Status | Resultado na Catraca |
|--------|---------------------|
| `true` | ✅ **ACESSO LIBERADO** |
| `false` | 🔒 **ACESSO BLOQUEADO** |
| `404` | ❌ **CPF NÃO CADASTRADO** |

---

### 3️⃣ LISTAR ALUNOS

```http
GET /alunos
Content-Type: application/json
```

**Resposta esperada (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "pietro mantuan",
    "cpf": "53888059801",
    "status": true
  }
]
```

---

### 4️⃣ CRIAR ALUNO

```http
POST /alunos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "12345678900",
  "status": true
}
```

**Resposta esperada (201 Created):**
```json
{
  "message": "Aluno adicionada com sucesso!"
}
```

---

### 5️⃣ EDITAR ALUNO

```http
PATCH /alunos/{id}
Content-Type: application/json

{
  "nome": "João Silva",
  "cpf": "12345678900",
  "status": true
}
```

**Resposta esperada (200 OK):**
```json
{
  "message": "Aluno atualizado com sucesso!"
}
```

---

### 6️⃣ DELETAR ALUNO

```http
DELETE /alunos/{id}
Authorization: Bearer {token}
```

**Resposta esperada (200 OK):**
```json
{
  "message": "Aluno deletado com sucesso!"
}
```

---

## 🔐 AUTENTICAÇÃO

A API usa JWT (JSON Web Tokens) para proteger endpoints que modificam dados. O token é obtido via login e deve ser incluído no header `Authorization: Bearer {token}`.

**Credenciais padrão:**
- Usuário: admin
- Senha: 1234

---

## 📊 STATUS DOS ALUNOS

- `true`: Aluno ativo (acesso liberado)
- `false`: Aluno inativo (acesso bloqueado)

A catraca converte automaticamente `true` → "Ativo" e `false` → "Inativo".
{
  "mensagem": "Controle de acesso sincronizado com sucesso",
  "alunoId": "1234567890",
  "podeEntrar": true,
  "status": "Ativo"
}
```

### 📋 Lógica de Sincronização

| Status | podeEntrar | Resultado |
|--------|-----------|-----------|
| **Ativo** | `true` | ✅ **LIBERA** entrada na academia |
| **Inativo** | `false` | 🔒 **BLOQUEIA** entrada na academia |
| **Suspenso** | `false` | 🔒 **BLOQUEIA** entrada na academia |
| **Deletado** | `false` | 🔒 **BLOQUEIA** entrada na academia |

---

## 🚀 FLUXO COMPLETO

### Exemplo: Aluno Paga e Precisa de Acesso

1. **Painel:** Admin muda status de "Suspenso" para "Ativo"
2. **API:** Recebe `PUT /api/alunos/{id}` com `status: "Ativo"`
3. **Sincronização:** Painel chama `POST /api/autenticacao/controle-entrada` com `podeEntrar: true`
4. **Sistema de Entrada:** Recebe ordem de LIBERAR acesso
5. **Result:** ✅ Aluno agora pode entrar na academia!

---

## ⚠️ TRATAMENTO DE ERROS

### 401 Unauthorized
- Token expirado ou inválido
- Painel redireciona para login automaticamente

### 403 Forbidden
- Usuário não tem permissão
- Painel exibe mensagem de erro

### Erro de Conexão
- Se a API está offline, o painel mostra: "Não foi possível conectar à API"

---

## 🔄 PADRÃO DE RESPOSTA

Todos os endpoints devem seguir este padrão:

**Sucesso:**
```json
{
  "status": "success",
  "mensagem": "Operação realizada com sucesso",
  "dados": { ... }
}
```

**Erro:**
```json
{
  "status": "error",
  "mensagem": "Descrição do erro",
  "codigo": "ERRO_001"
}
```

---

## 🔑 HEADERS OBRIGATÓRIOS

- `Content-Type: application/json`
- `Authorization: Bearer {token}` (exceto login)

---

## 📝 EXEMPLO COMPLETO COM NODE.JS/EXPRESS

### Backend mínimo para testar:

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());

// Login
app.post('/api/autenticacao/login', (req, res) => {
  const { usuario, senha } = req.body;
  
  if (usuario === 'admin' && senha === '1234') {
    res.json({
      token: 'token_fake_123',
      usuario: 'admin',
      mensagem: 'Login realizado'
    });
  } else {
    res.status(401).json({ mensagem: 'Inválido' });
  }
});

// Listar alunos
app.get('/api/alunos', (req, res) => {
  res.json([
    {
      id: '123',
      nome: 'João Silva',
      email: 'joao@email.com',
      status: 'Ativo'
    }
  ]);
});

// Sincronizar entrada
app.post('/api/autenticacao/controle-entrada', (req, res) => {
  const { alunoId, podeEntrar, status } = req.body;
  res.json({
    mensagem: 'Sincronizado com sucesso',
    alunoId,
    podeEntrar,
    status
  });
});

app.listen(3000, () => console.log('API rodando em http://localhost:3000'));
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] URL da API configurada em `admin.js`
- [ ] Endpoint de LOGIN implementado
- [ ] Endpoint de GET alunos implementado
- [ ] Endpoint de POST alunos implementado
- [ ] Endpoint de PUT alunos implementado
- [ ] Endpoint de DELETE alunos implementado
- [ ] Endpoint de controle-entrada implementado
- [ ] Sistema de entrada integrado
- [ ] Testes de sincronização realizados

---

## 🆘 TROUBLESHOOTING

**Problema:** "Não foi possível conectar à API"
- ✅ Verifique se a API está rodando
- ✅ Verifique se a URL em `admin.js` está correta
- ✅ Verifique CORS (cross-origin)

**Problema:** "Sessão expirada"
- ✅ Faça login novamente
- ✅ Verifique se o token está sendo armazenado
- ✅ Verifique expiração do token na API

**Problema:** "Erro ao salvar aluno"
- ✅ Verifique se todos os campos obrigatórios estão preenchidos
- ✅ Verifique formato dos dados (datas, telefone, etc)
- ✅ Verifique logs da API

---

**Sucesso! 🎉 Agora seu painel está integrado com a API e sincroniza automaticamente com o sistema de entrada!**
