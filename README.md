# 🏋️ Painel Administrativo - M&P Performance

Sistema de gestão de alunos para a academia **M&P Performance** com funcionalidades completas de CRUD (Criar, Ler, Atualizar e Deletar).

## 📋 Características

✅ **Autenticação de Usuário** - Login seguro para acesso ao painel
✅ **Cadastro de Alunos** - Registrar novos alunos com informações completas
✅ **Consulta de Alunos** - Visualizar lista completa de alunos em tabela com filtros
✅ **Edição de Alunos** - Atualizar dados de alunos existentes
✅ **Exclusão de Alunos** - Remover alunos do sistema
✅ **Pesquisa em Tempo Real** - Filtrar alunos por nome, email ou telefone
✅ **Estatísticas** - Dashboard com Cards de resumo (Total, Ativos, Inativos, Novos este mês)
✅ **Exportação em CSV** - Baixar lista de alunos em arquivo Excel
✅ **Armazenamento Local** - Dados salvos no localStorage do navegador
✅ **Interface Responsiva** - Funciona em desktop e dispositivos móveis
✅ **Design Moderno** - Utilizando Tailwind CSS com tema vermelho degradê

## 🔐 Credenciais de Acesso

**Usuário:** `admin`
**Senha:** `1234`

## 📊 Campos do Aluno

- **Nome Completo** *(obrigatório)*
- **Email** *(obrigatório)*
- **Telefone** *(obrigatório)*
- **CPF** *(opcional)*
- **Data de Nascimento** *(opcional)*
- **Modalidade** *(obrigatório)*
  - Musculação
  - Crossfit
  - Natação
  - Personal Trainer
  - Pilates
  - Yoga
  - Funcional
  - Spinning
- **Data de Adesão** *(obrigatório)*
- **Plano** *(obrigatório)*
  - Mensal
  - Trimestral (3 meses)
  - Semestral (6 meses)
  - Anual
- **Endereço** *(opcional)*
- **Observações** *(opcional)*
- **Status** *(opcional)*
  - Ativo
  - Inativo
  - Suspenso

## 🎨 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **Tailwind CSS** - Framework CSS moderno
- **JavaScript Puro** - Lógica da aplicação
- **SweetAlert2** - Modais e notificações elegantes
- **FontAwesome** - Ícones
- **localStorage** - Armazenamento de dados local

## 🚀 Como Usar

### 1. Abrir o Painel
Abra o arquivo `index.html` em um navegador de sua preferência.

### 2. Fazer Login
- Digite `admin` no campo de usuário
- Digite `1234` no campo de senha
- Clique em "Acessar Painel"

### 3. Cadastrar um Novo Aluno
- Clique no botão **"+ Novo Aluno"**
- Preencha os campos obrigatórios (marcados com *)
- Clique em **"Salvar Aluno"**

### 4. Buscar Alunos
- Digite na barra de pesquisa (nome, email ou telefone)
- A tabela será filtrada em tempo real

### 5. Editar um Aluno
- Clique no ícone de **lápis** na linha do aluno
- Modifique os dados desejados
- Clique em **"Salvar Aluno"**

### 6. Deletar um Aluno
- Clique no ícone de **lixeira** na linha do aluno
- Confirme a exclusão
- O aluno será removido do sistema

### 7. Exportar Dados
- Clique em **"Exportar"**
- Um arquivo CSV será baixado com todos os alunos
- Abra em Excel ou Google Sheets

### 8. Atualizar Dados
- Clique em **"Atualizar"** para recarregar a tabela
- Os dados já estarão sincronizados (armazenados localmente)

### 9. Logout
- Clique em **"Sair"** no menu lateral (sidebar)
- Será direcionado para a tela de login

## 📊 Cards de Resumo

- **Total** - Quantidade total de alunos cadastrados
- **Ativos** - Alunos com status "Ativo"
- **Inativos** - Alunos com status "Inativo" ou "Suspenso"
- **Este Mês** - Alunos cadastrados no mês atual

## 💾 Armazenamento de Dados

Os dados dos alunos são armazenados no **localStorage** do navegador:
- Persiste entre sessões
- Não requer servidor externo
- Dados armazenados localmente no seu computador

### Para limpar dados (se necessário):
Abra o console do navegador (F12) e execute:
```javascript
localStorage.removeItem('alunos');
localStorage.removeItem('loginAtivo');
```

## 🎯 Dicas de Uso

1. **Sempre preencha os campos obrigatórios** - Eles são marcados com *
2. **Use a barra de pesquisa** - Para encontrar alunos rapidamente
3. **Exporte regularmente** - Para manter backup dos dados
4. **Verifique o status** - Use "Ativo", "Inativo" ou "Suspenso" para controlar alunos
5. **Adicione observações** - Para anotações especiais sobre o aluno

## 🔒 Segurança

⚠️ **Nota:** Este painel utiliza autenticação simples e armazenamento local. Para ambiente de produção, considere:
- Implementar autenticação com servidor backend
- Usar banco de dados seguro
- Aplicar criptografia de dados
- Implementar controle de acesso por perfil

## 🛠️ Suporte

Para problemas ou melhorias, entre em contato com a equipe de desenvolvimento da M&P Performance.

---

**M&P Performance** © 2026 - Todos os direitos reservados.
