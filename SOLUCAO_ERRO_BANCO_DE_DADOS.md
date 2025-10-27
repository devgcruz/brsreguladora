# 🚨 SOLUÇÃO: Erro de Acesso ao Banco de Dados

## ❌ Erro Atual:
```
Access denied for user 'brs_database'@'179.188.54.16' (using password: YES)
```

## 🔍 Diagnóstico

O erro indica que:
1. O usuário `brs_database` existe
2. A senha está sendo enviada corretamente
3. **MAS o IP do servidor (179.188.54.16) NÃO tem permissão para acessar o banco**

## ✅ SOLUÇÃO: Liberar Acesso ao IP no Banco de Dados

### Passo 1: Acessar o Painel da Locaweb

1. Acesse: https://painel.locaweb.com.br
2. Faça login com suas credenciais
3. Vá em **"Bancos de Dados"** → **"MySQL"**

### Passo 2: Liberar o IP do Servidor

1. Encontre seu banco de dados `brs_database`
2. Clique em **"Gerenciar"** ou **"Configurar"**
3. Procure por **"IPs Permitidos"** ou **"Controle de Acesso"**
4. Adicione o IP: `179.188.54.16`
5. Ou libere **TODOS os IPs** temporariamente: `%` ou `*`

### Passo 3: Verificar Credenciais

Certifique-se de que no arquivo `.env` do servidor (`brs-api/.env`) estão configurados:

```env
DB_HOST=brs_database.mysql.dbaas.com.br
DB_DATABASE=brs_database
DB_USERNAME=brs_database
DB_PASSWORD=[SUA_SENHA_CORRETA]
```

## 🛠️ Alternativa: Verificar Credenciais Via phpMyAdmin

1. Acesse o phpMyAdmin da Locaweb
2. Tente fazer login com:
   - Usuário: `brs_database`
   - Senha: (a senha que você configurou)
3. Se funcionar no phpMyAdmin, o problema é realmente o IP

## 🔧 Passos Imediatos no Servidor

Depois de liberar o IP, execute no servidor:

```bash
cd /home/storage/0/f6/5a/brsreguladora1/public_html/api

# Limpar cache
php artisan config:clear
php artisan cache:clear

# Recriar cache
php artisan config:cache
```

## ⚠️ IMPORTANTE: Verificar .env no Servidor

O arquivo `.env` no servidor DEVE estar com as credenciais corretas.

No servidor, verifique:
```bash
cat /home/storage/0/f6/5a/brsreguladora1/public_html/api/.env | grep DB_
```

Deve mostrar algo como:
```env
DB_HOST=brs_database.mysql.dbaas.com.br
DB_DATABASE=brs_database
DB_USERNAME=brs_database
DB_PASSWORD=sua_senha_aqui
```

## 📋 Checklist Final

- [ ] IP `179.188.54.16` liberado no banco de dados
- [ ] Credenciais corretas no `.env` do servidor
- [ ] Cache limpo e recriado (`php artisan config:cache`)
- [ ] Testar login novamente

## 🆘 Se Ainda Não Funcionar

1. **Criar novo usuário no banco** com privilégios totais
2. **Alterar a senha** do banco de dados
3. **Verificar se o host está correto** no painel da Locaweb

## 📞 Contato Locaweb

Se o problema persistir, entre em contato com o suporte da Locaweb:
- Telefone: 3003-6464
- Chat: Disponível no painel
- Informe: IP do servidor (179.188.54.16) precisa acessar o banco
