nf# 🚀 VPS Deployment Guide - Google Cloud + Nginx + PM2 (Optimized for 8GB RAM / 2 CPU)

## Крок 1: Створення VPS на Google Cloud

### 1.1 Створіть VM Instance:
```bash
# Google Cloud Console → Compute Engine → VM Instances → Create Instance

Налаштування:
- Name: tripsforua-server
- Region: europe-west1 (Бельгія - найближче до України)
- Zone: europe-west1-b
- Machine type: e2-small (2 vCPU, 2GB RAM) - достатньо для початку
- Boot disk: Ubuntu 22.04 LTS, 20GB SSD
- Firewall: ✅ Allow HTTP, ✅ Allow HTTPS
```

### 1.2 Додайте SSH ключ:
```bash
# На вашому комп'ютері
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Скопіюйте публічний ключ
cat ~/.ssh/id_rsa.pub

# Додайте в Google Cloud Console → Compute Engine → Metadata → SSH Keys
```

### 1.3 Підключіться до сервера:
```bash
ssh your-username@EXTERNAL_IP
```

---

## Крок 2: Налаштування сервера

### 2.1 Оновлення системи:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Встановлення Node.js 18:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Має бути v18.x.x
npm --version
```

### 2.3 Встановлення MongoDB:
```bash
# Імпорт ключа
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Додати репозиторій
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Встановити
sudo apt update
sudo apt install -y mongodb-org

# Запустити та додати в автозапуск
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl status mongod
```

### 2.4 Налаштування безпеки MongoDB:
```bash
# Створити admin користувача
mongosh

# В MongoDB shell:
use admin
db.createUser({
  user: "admin",
  pwd: "STRONG_PASSWORD_HERE",
  roles: ["root"]
})

# Створити користувача для бази tripsforua
use tripsforua
db.createUser({
  user: "tripsforua_user",
  pwd: "ANOTHER_STRONG_PASSWORD",
  roles: ["readWrite"]
})
exit

# Увімкнути authentication
sudo nano /etc/mongod.conf

# Додати ці налаштування:
# security:
#   authorization: enabled
#
# storage:
#   wiredTiger:
#     engineConfig:
#       cacheSizeGB: 2  # Для 8GB RAM можна виділити 2GB під MongoDB cache

# Перезапустити
sudo systemctl restart mongod
```

### 2.5 Встановлення PM2 (Process Manager):
```bash
sudo npm install -g pm2
```

### 2.6 Встановлення Nginx:
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Крок 3: Deployment коду

### 3.1 Встановлення Git:
```bash
sudo apt install -y git
```

### 3.2 Клонування репозиторію:
```bash
cd /var/www
sudo mkdir tripsforua
sudo chown $USER:$USER tripsforua
cd tripsforua

# Якщо код в GitHub:
git clone https://github.com/YOUR_USERNAME/tripsforua.git .

# Або скопіюйте код через scp:
# На локальному комп'ютері:
# scp -r /path/to/tripsForUA/* username@EXTERNAL_IP:/var/www/tripsforua/
```

### 3.3 Встановлення залежностей:
```bash
cd /var/www/tripsforua

# Backend
npm install

# Frontend
cd client
npm install
npm run build
cd ..
```

### 3.4 Створення .env файлу:
```bash
nano .env
```

Вставте:
```env
# Server
PORT=5051
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://tripsforua_user:ANOTHER_STRONG_PASSWORD@localhost:27017/tripsforua?authSource=tripsforua

# JWT
JWT_SECRET=ВАШ_СУПЕР_СЕКРЕТНИЙ_КЛЮЧ_МІНІМУМ_32_СИМВОЛИ
JWT_EXPIRE=30d

# Admin
ADMIN_EMAIL=illiakryvoruchka@gmail.com
ADMIN_PASSWORD=riir48CJRJei272
ADMIN_NAME=Ілля Криворучка

# Frontend (ваш домен)
FRONTEND_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### 3.5 Міграція даних (якщо потрібно):
```bash
# На локальному комп'ютері експортуйте дані:
mongodump --uri="mongodb://localhost:27017/tripsforua" --out=./backup

# Скопіюйте на сервер:
scp -r ./backup username@EXTERNAL_IP:/tmp/

# На сервері імпортуйте:
mongorestore --uri="mongodb://tripsforua_user:PASSWORD@localhost:27017/tripsforua?authSource=tripsforua" /tmp/backup/tripsforua
```

---

## Крок 4: PM2 Configuration

### 4.1 Створіть ecosystem файл:
```bash
cd /var/www/tripsforua
nano ecosystem.config.js
```

Вставте (оптимізовано для 8GB RAM / 2 CPU):
```javascript
module.exports = {
  apps: [{
    name: 'tripsforua',
    script: './server/index.js',
    instances: 4,  // 2 instances на CPU core для 8GB RAM
    exec_mode: 'cluster',
    max_memory_restart: '1G',  // Рестарт якщо процес використовує >1GB
    env: {
      NODE_ENV: 'production',
      PORT: 5051
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

### 4.2 Створіть папку для логів:
```bash
mkdir logs
```

### 4.3 Запустіть додаток:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Виконайте команду, яку покаже PM2
```

### 4.4 Корисні PM2 команди:
```bash
pm2 list                 # Список процесів
pm2 logs tripsforua      # Дивитися логи
pm2 restart tripsforua   # Рестарт
pm2 stop tripsforua      # Зупинити
pm2 monit                # Моніторинг
```

---

## Крок 5: Nginx Configuration

### 5.1 Створіть конфігурацію:
```bash
sudo nano /etc/nginx/sites-available/tripsforua
```

Вставте (оптимізовано для 8GB RAM):
```nginx
# Глобальні налаштування Nginx (додайте на початку файлу /etc/nginx/nginx.conf):
# worker_processes 2;  # По кількості CPU cores
# worker_connections 2048;  # Для 8GB RAM можна збільшити

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirect to HTTPS (буде після отримання SSL)
    # return 301 https://$server_name$request_uri;

    # Тимчасово для тестування:
    location / {
        proxy_pass http://localhost:5051;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts для кращої продуктивності
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings для 8GB RAM
        proxy_buffer_size 8k;
        proxy_buffers 8 8k;
        proxy_busy_buffers_size 16k;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Static files
    location /uploads {
        alias /var/www/tripsforua/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_buffers 16 8k;  # Більше буферів для 8GB RAM

    client_max_body_size 50M;  # Збільшено до 50MB для завантаження файлів
    client_body_buffer_size 128k;
}
```

### 5.2 Активуйте конфігурацію:
```bash
sudo ln -s /etc/nginx/sites-available/tripsforua /etc/nginx/sites-enabled/
sudo nginx -t  # Перевірка конфігурації
sudo systemctl restart nginx
```

---

## Крок 6: DNS Configuration

### В адміністративній панелі вашого domain registrar:

```
Type    Name    Value               TTL
A       @       EXTERNAL_IP         3600
A       www     EXTERNAL_IP         3600
```

Де `EXTERNAL_IP` - це IP вашого Google Cloud VM.

Зачекайте 5-30 хвилин для DNS propagation.

Перевірте:
```bash
ping your-domain.com
```

---

## Крок 7: SSL Certificate (Let's Encrypt)

### 7.1 Встановлення Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Отримання сертифіката:
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot автоматично налаштує Nginx для HTTPS!

### 7.3 Авто-оновлення:
```bash
sudo systemctl status certbot.timer
# Має бути active
```

### 7.4 Оновіть Nginx config:
```bash
sudo nano /etc/nginx/sites-available/tripsforua
```

Розкоментуйте redirect на HTTPS:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

```bash
sudo systemctl restart nginx
```

---

## Крок 8: Firewall (UFW)

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

---

## Крок 9: Моніторинг та Backup

### 9.1 Автоматичний backup MongoDB:
```bash
mkdir -p /home/$USER/backups
nano /home/$USER/backup-mongo.sh
```

Вставте:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/$USER/backups"
mongodump --uri="mongodb://tripsforua_user:PASSWORD@localhost:27017/tripsforua?authSource=tripsforua" --out="$BACKUP_DIR/backup_$DATE"
# Видалити backup старше 7 днів
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
chmod +x /home/$USER/backup-mongo.sh

# Додайте в crontab (щоденний backup о 3:00)
crontab -e
# Додайте:
0 3 * * * /home/$USER/backup-mongo.sh
```

### 9.2 Моніторинг:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Крок 10: Оновлення сайту

### Коли потрібно оновити код:

```bash
cd /var/www/tripsforua

# Пул змін з Git
git pull

# Або скопіюйте нові файли через scp

# Оновіть залежності якщо потрібно
npm install
cd client && npm install && npm run build && cd ..

# Рестарт PM2
pm2 restart tripsforua
```

---

## Troubleshooting

### Сайт не відкривається:
```bash
# Перевірте PM2
pm2 list
pm2 logs tripsforua

# Перевірте Nginx
sudo nginx -t
sudo systemctl status nginx

# Перевірте MongoDB
sudo systemctl status mongod
mongosh --eval "db.adminCommand('ping')"
```

### Помилки CORS:
- Перевірте CORS_ORIGINS в .env
- Рестартуйте PM2: `pm2 restart tripsforua`

### SSL не працює:
```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

---

## Performance Optimization

### Для кращої швидкості додайте в Nginx:

```nginx
# Додайте в server block
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Security Checklist

- ✅ MongoDB authentication
- ✅ Firewall (UFW)
- ✅ SSL Certificate
- ✅ PM2 cluster mode
- ✅ Nginx security headers
- ✅ Regular backups
- ✅ Rate limiting (в коді)
- ✅ Helmet.js (в коді)

---

## Cloudflare (Опціонально, але рекомендовано)

1. Додайте домен до Cloudflare
2. Зміните nameservers у domain registrar
3. Cloudflare → SSL/TLS → Full (strict)
4. Cloudflare → Security → DDoS Protection (автоматично)
5. Cloudflare → Speed → Auto Minify (JS, CSS, HTML)

---

## Контакти

- Telegram: @trips_for_ukr
- Email: illiakryvoruchka@gmail.com

**Сайт готовий до роботи!** 🚀
