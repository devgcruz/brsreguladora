# 🚀 INSTRUÇÕES DE DEPLOY PARA PRODUÇÃO

## 📋 Checklist Pré-Deploy

Antes de fazer o deploy, certifique-se de:

- [ ] Todos os testes locais estão passando
- [ ] Código está no branch correto (master/main)
- [ ] Variáveis de ambiente estão configuradas corretamente
- [ ] Credenciais de banco de dados estão corretas
- [ ] Senha do e-mail está configurada
- [ ] Domínio está apontado corretamente
- [ ] Certificado SSL está configurado (HTTPS)

---

## 🔧 PASSO 1: Configurar Frontend (.env.production)

1. Abra o arquivo `TEMPLATE.env.production.txt`
2. Copie TODO o conteúdo
3. Cole no arquivo `.env.production` na raiz do projeto

```bash
# Conteúdo do arquivo .env.production:
REACT_APP_API_URL=https://brsreguladora.com.br/api
GENERATE_SOURCEMAP=false
```

**⚠️ IMPORTANTE:** 
- Certifique-se de que a URL da API está correta
- O arquivo `.env.production` NÃO deve ser commitado no git

---

## 🔧 PASSO 2: Configurar Backend (brs-api/.env)

1. Abra o arquivo `TEMPLATE.brs-api.env.txt`
2. Copie TODO o conteúdo
3. Cole no arquivo `brs-api/.env`

**⚠️ ATENÇÃO:** Revise TODAS as configurações, especialmente:

- ✅ `APP_URL` - URL correta do site em produção
- ✅ `DB_HOST` - Host correto do banco de dados
- ✅ `DB_PASSWORD` - Senha correta do banco
- ✅ `MAIL_PASSWORD` - Senha correta do e-mail
- ✅ `CORS_ALLOWED_ORIGINS` - Domínios permitidos

---

## 🔧 PASSO 3: Build do Frontend

```bash
# Na raiz do projeto
npm install
npm run build
```

O comando `npm run build` irá:
- Gerar os arquivos otimizados na pasta `build/`
- Usar automaticamente as variáveis do `.env.production`
- Desabilitar source maps (GENERATE_SOURCEMAP=false)

---

## 🔧 PASSO 4: Otimizar Backend (Laravel)

```bash
cd brs-api

# Instalar dependências
composer install --optimize-autoloader --no-dev

# Limpar cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Otimizar autoloader
composer dump-autoload -o

# Gerar APP_KEY (se necessário)
php artisan key:generate --force
```

---

## 🔧 PASSO 5: Configurações de Servidor (Apache/Nginx)

### Para Apache (.htaccess)

Certifique-se de que o `.htaccess` na pasta `build/` está correto:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Para Nginx

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name brsreguladora.com.br www.brsreguladora.com.br;
    
    root /var/www/prototipo-brs/build;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Configuração da API Laravel
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔧 PASSO 6: Permissões de Arquivo

```bash
# No servidor, configurar permissões corretas
cd brs-api

# Dar permissão para escrita nas pastas necessárias
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## 🔒 SEGURANÇA

### Configurações Importantes:

1. **APP_DEBUG=false** - NUNCA deixe true em produção
2. **GENERATE_SOURCEMAP=false** - Desabilitar source maps
3. **SESSION_SECURE_COOKIE=true** - Cookies seguros em HTTPS
4. **LOG_LEVEL=error** - Logar apenas erros em produção
5. **CORS_ALLOWED_ORIGINS** - Configurar domínios permitidos

---

## 📊 MONITORAMENTO

Após o deploy, verifique:

- [ ] Site carrega corretamente (https://brsreguladora.com.br)
- [ ] Login funciona
- [ ] API responde corretamente (/api/entradas)
- [ ] Dashboard carrega dados reais
- [ ] Upload de PDFs funciona
- [ ] Logs não mostram erros (storage/logs/)

---

## 🐛 TROUBLESHOOTING

### Erro 500 no backend:
```bash
cd brs-api
php artisan config:clear
php artisan cache:clear
php artisan config:cache
```

### Frontend não carrega:
- Verifique se a build foi feita corretamente
- Verifique se a URL da API está correta no .env.production
- Verifique os logs do navegador (F12)

### CORS Error:
- Verifique `CORS_ALLOWED_ORIGINS` no .env do backend
- Adicione o domínio correto

---

## 📞 SUPORTE

Em caso de problemas:
1. Verifique os logs em `brs-api/storage/logs/`
2. Verifique os logs do servidor (Apache/Nginx)
3. Verifique o console do navegador (F12)

---

**✅ Deploy concluído com sucesso!**
