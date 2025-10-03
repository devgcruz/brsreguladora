# BRS API - Sistema de Gerenciamento de Sinistros

API RESTful moderna e segura para o Sistema de Gerenciamento BRS, construída com Laravel 10 e Laravel Sanctum.

## 🚀 Características

- **Autenticação Segura**: Laravel Sanctum para autenticação baseada em tokens
- **Arquitetura Limpa**: Separação clara entre Models, Controllers, Services e Resources
- **Validação Robusta**: Form Requests para validação de dados
- **Auditoria Completa**: Log de todas as ações dos usuários
- **API RESTful**: Endpoints padronizados seguindo convenções REST
- **Segurança**: Middleware de permissões e autenticação
- **Documentação**: Código bem documentado e estruturado

## 📋 Funcionalidades

### 🔐 Autenticação
- Login/Logout com tokens
- Verificação de permissões
- Dados do usuário autenticado

### 📊 Registros de Entrada
- CRUD completo de registros
- Busca e filtros avançados
- Estatísticas e relatórios
- Upload de documentos PDF

### 💰 Financeiro
- Gestão de dados financeiros
- Controle de pagamentos
- Relatórios financeiros
- Estatísticas de valores

### ⚖️ Judicial
- Processos judiciais
- Diligências
- Controle de honorários
- Relatórios judiciais

### 👥 Usuários
- Gestão de usuários
- Controle de permissões
- Níveis de acesso
- Auditoria de ações

### 📈 Auditoria
- Log completo de ações
- Filtros e exportação
- Estatísticas de uso
- Limpeza automática

## 🛠️ Tecnologias

- **Laravel 10**: Framework PHP moderno
- **Laravel Sanctum**: Autenticação API
- **MySQL**: Banco de dados
- **Eloquent ORM**: Mapeamento objeto-relacional
- **Form Requests**: Validação de dados
- **API Resources**: Transformação de dados

## 📦 Instalação

### Pré-requisitos
- PHP 8.1+
- Composer
- MySQL 5.7+
- Node.js (para frontend)

### 1. Clone o repositório
```bash
git clone <repository-url>
cd brs-api
```

### 2. Instale as dependências
```bash
composer install
```

### 3. Configure o ambiente
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brs_database
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

### 4. Gere a chave da aplicação
```bash
php artisan key:generate
```

### 5. Execute as migrations
```bash
php artisan migrate
```

### 6. Inicie o servidor
```bash
php artisan serve
```

A API estará disponível em `http://localhost:8000`

## 🔗 Endpoints da API

### Autenticação
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Dados do usuário
- `GET /api/check-permission/{permission}` - Verificar permissão

### Registros
- `GET /api/entradas` - Listar registros
- `POST /api/entradas` - Criar registro
- `GET /api/entradas/{id}` - Obter registro
- `PUT /api/entradas/{id}` - Atualizar registro
- `DELETE /api/entradas/{id}` - Excluir registro
- `GET /api/entradas/statistics` - Estatísticas

### Financeiro
- `GET /api/financeiro` - Listar dados financeiros
- `POST /api/financeiro` - Criar dados financeiros
- `GET /api/financeiro/{id}` - Obter dados financeiros
- `PUT /api/financeiro/{id}` - Atualizar dados financeiros
- `DELETE /api/financeiro/{id}` - Excluir dados financeiros
- `GET /api/financeiro/entrada/{entrada}` - Dados por entrada
- `GET /api/financeiro/statistics` - Estatísticas

### Judicial
- `GET /api/judicial` - Listar processos
- `POST /api/judicial` - Criar processo
- `GET /api/judicial/{id}` - Obter processo
- `PUT /api/judicial/{id}` - Atualizar processo
- `DELETE /api/judicial/{id}` - Excluir processo
- `GET /api/judicial/entrada/{entrada}` - Processo por entrada
- `GET /api/judicial/statistics` - Estatísticas

### Usuários (Admin)
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `GET /api/usuarios/{id}` - Obter usuário
- `PUT /api/usuarios/{id}` - Atualizar usuário
- `DELETE /api/usuarios/{id}` - Excluir usuário
- `PATCH /api/usuarios/{id}/toggle-status` - Alterar status
- `POST /api/usuarios/{id}/change-password` - Alterar senha
- `GET /api/usuarios/statistics` - Estatísticas

### Auditoria (Admin)
- `GET /api/auditoria` - Listar logs
- `GET /api/auditoria/{id}` - Obter log
- `GET /api/auditoria/statistics` - Estatísticas
- `POST /api/auditoria/export` - Exportar logs
- `DELETE /api/auditoria/clean-old` - Limpar logs antigos

## 🔒 Autenticação

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "admin",
    "senha": "123456"
  }'
```

### Usar token
```bash
curl -X GET http://localhost:8000/api/entradas \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `tab_entrada` - Registros de entrada
- `tab_financeiro` - Dados financeiros
- `tab_judicial` - Processos judiciais
- `tab_diligencia` - Diligências
- `usuarios` - Usuários do sistema
- `audit_logs` - Logs de auditoria

### Relacionamentos
- Entrada → Financeiro (1:1)
- Entrada → Judicial (1:1)
- Judicial → Diligência (1:N)
- Entrada → PDF (1:N)
- Usuário → Entrada (1:N)

## 🛡️ Segurança

- **Autenticação**: Laravel Sanctum
- **Autorização**: Middleware de permissões
- **Validação**: Form Requests
- **Auditoria**: Log de todas as ações
- **Sanitização**: Proteção contra SQL Injection
- **CORS**: Configurado para frontend

## 📈 Monitoramento

- Logs de auditoria completos
- Estatísticas de uso
- Monitoramento de performance
- Alertas de segurança

## 🚀 Deploy

### Produção
1. Configure o servidor web (Nginx/Apache)
2. Configure SSL/TLS
3. Configure banco de dados
4. Execute migrations
5. Configure cache e sessões

### Docker (Opcional)
```bash
docker-compose up -d
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@brs.com
- Documentação: [Link para documentação]
- Issues: [Link para issues]

---

**BRS API** - Sistema de Gerenciamento de Sinistros
Desenvolvido com ❤️ usando Laravel

