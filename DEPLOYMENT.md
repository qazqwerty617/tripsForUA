# 🚀 Deployment Guide - TripsForUA

## Перед деплоєм

### 1. MongoDB Atlas Setup

1. Створіть акаунт на [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Створіть новий кластер (Free tier підходить для початку)
3. Create Database User:
   - Username: `tripsforua_admin`
   - Password: (генеруйте складний пароль)
4. Network Access: Add IP `0.0.0.0/0` (для тестування, пізніше обмежте)
5. Get Connection String:
   ```
   mongodb+srv://tripsforua_admin:<password>@cluster0.xxxxx.mongodb.net/tripsforua?retryWrites=true&w=majority
   ```

### 2. Міграція даних

```bash
# Експорт локальної бази
mongodump --uri="mongodb://localhost:27017/tripsforua" --out=./backup

# Імпорт в Atlas
mongorestore --uri="mongodb+srv://tripsforua_admin:<password>@cluster0.xxxxx.mongodb.net/tripsforua" ./backup/tripsforua
```

---

## Варіант 1: Vercel (Рекомендовано - Найпростіший)

### Переваги:
- ✅ Безкоштовний для малих проектів
- ✅ Автодеплой з GitHub
- ✅ SSL сертифікат автоматично
- ✅ CDN по всьому світу

### Крокиоптимизация/production optimizationДеплою:

1. **Підготовка репозиторію:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tripsforua.git
   git push -u origin main
   ```

2. **Створення проекту на Vercel:**
   - Йдіть на [vercel.com](https://vercel.com)
   - Import Git Repository
   - Виберіть ваш репозиторій

3. **Конфігурація:**
   - Root Directory: залиште порожнім
   - Build Command: `npm run build:all`
   - Output Directory: `client/dist`
   - Install Command: `npm install && cd client && npm install`

4. **Environment Variables:**
   ```
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=<генеруйте сильний секрет>
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.vercel.app
   ```

5. **Deploy!**

### Custom Domain:
- Vercel → Settings → Domains → Add Domain
- Додайте ваш домен (наприклад, tripsforua.com)
- Налаштуйте DNS записи згідно інструкцій Vercel

---

## Варіант 2: Google Cloud Platform

### Cloud Run (Containerized)

1. **Створіть Dockerfile:**
   ```dockerfile
   # В кореневій папці проекту
   FROM node:18-alpine
   WORKDIR /app
   
   # Copy package files
   COPY package*.json ./
   COPY client/package*.json ./client/
   COPY server/package*.json ./server/
   
   # Install dependencies
   RUN npm install
   RUN cd client && npm install
   RUN cd server && npm install
   
   # Copy source
   COPY . .
   
   # Build client
   RUN npm run build:client
   
   EXPOSE 8080
   ENV PORT=8080
   CMD ["node", "server/index.js"]
   ```

2. **Deploy:**
   ```bash
   gcloud run deploy tripsforua \
     --source . \
     --platform managed \
     --region europe-west1 \
     --allow-unauthenticated
   ```

---

## Варіант 3: Netlify + Railway

### Frontend (Netlify):
1. Netlify → New Site from Git
2. Build command: `cd client && npm install && npm run build`
3. Publish directory: `client/dist`

### Backend (Railway):
1. [railway.app](https://railway.app) → New Project
2. Deploy from GitHub
3. Add MongoDB Atlas connection string
4. Railway автоматично деплоїть Node.js сервер

---

## Production Checklist

### Безпека:
- [ ] Змінити JWT_SECRET на сильний пароль
- [ ] Обмежити CORS_ORIGINS до вашого домену
- [ ] Налаштувати Network Access в MongoDB Atlas
- [ ] Увімкнути HTTPS (автоматично на всіх платформах)

### Performance:
- [ ] Увімкнути Cloudflare CDN (опціонально)
- [ ] Додати Google Analytics (якщо потрібно)
- [ ] Налаштувати monitoring (Sentry, LogRocket)

### SEO:
- [ ] Submit sitemap до Google Search Console
- [ ] Налаштувати robots.txt
- [ ] Додати Google My Business

### Тестування:
- [ ] Перевірити на мобільних
- [ ] Google PageSpeed Insights
- [ ] Lighthouse audit
- [ ] Перевірити всі форми

---

## Scripts для package.json

Додайте ці scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:server\" \"npm run dev:client\"",
    "dev:server": "cd server && nodemon index.js",
    "dev:client": "cd client && npm run dev",
    "build:client": "cd client && npm run build",
    "build:all": "npm install && cd client && npm install && npm run build && cd ..",
    "start": "node server/index.js",
    "start:prod": "NODE_ENV=production node server/index.js"
  }
}
```

---

## Cloudflare DDoS Protection (Рекомендовано)

1. Додайте домен до Cloudflare
2. Змініть nameservers у вашого domain registrar
3. Cloudflare → Security → DDoS Protection (автоматично)
4. WAF Rules для додаткового захисту

---

## Моніторинг після запуску

### Google PageSpeed:
```
https://pagespeed.web.dev/
```

### Uptime Monitoring:
- [UptimeRobot](https://uptimerobot.com) - безкоштовний
- [Pingdom](https://www.pingdom.com)

---

## Підтримка та оновлення

### Автоматичні оновлення:
- Vercel/Netlify: Push до GitHub → автодеплой
- Railway: Push до GitHub → автодеплой

### Ручні оновлення:
```bash
git add .
git commit -m "Update: <опис змін>"
git push origin main
```

---

## Troubleshooting

### Помилка "Cannot connect to MongoDB":
- Перевірте connection string
- Перевірте Network Access в MongoDB Atlas
- Перевірте username/password

### 404 на маршрутах:
- Перевірте налаштування rewrites/redirects
- Для SPA потрібен fallback до index.html

### CORS errors:
- Додайте домен до CORS_ORIGINS
- Перевірте FRONTEND_URL в .env

---

## Контакти підтримки

Якщо виникнуть питання:
- Telegram: @trips_for_ukr
- Email: illiakryvoruchka@gmail.com
