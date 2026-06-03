const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

dotenv.config();

const app = express();

// Trust proxy (required for correct IP detection behind Nginx/Cloudflare)
app.set('trust proxy', 1);

// Middleware
// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: false,
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'upgrade-insecure-requests': null,
      'img-src': ["'self'", 'data:', 'https:', 'blob:'],
      'connect-src': ["'self'", 'https:'],
      'font-src': ["'self'", 'https:', 'data:']
    }
  }
}));

// Compression for responses
app.use(compression());

// Rate limiting optimized for 8GB RAM server
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Збільшено до 1000 для 8GB RAM (було 300)
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Забагато запитів з цього IP, спробуйте пізніше'
});
app.use('/api', limiter);

// Prevent NoSQL injections and HTTP param pollution
app.use(mongoSanitize());
app.use(hpp());

// CORS (restrict in production if CORS_ORIGINS set)
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origin === 'null' || allowedOrigins.length === 0) return cb(null, true);
    return allowedOrigins.includes(origin) ? cb(null, true) : cb(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Static: uploads with long-term caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), { maxAge: '30d', etag: true, immutable: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB підключено'))
  .catch((err) => console.error('❌ Помилка підключення до MongoDB:', err));

// Routes
app.use('/api/tours', require('./routes/tours'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/aviatury', require('./routes/aviatury'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const distPath = path.join(__dirname, '../client/dist');
  const indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

  // Serve static assets
  app.use(express.static(distPath, { index: false, maxAge: '7d', etag: true }));

  // Handle SEO routes
  app.get(['/tours/:id', '/destinations/:slug'], async (req, res) => {
    try {
      let title = 'Trips for Ukraine';
      let description = 'Авторські тури по всьому світу для українців';
      let image = '';

      if (req.params.id) {
        const Tour = require('./models/Tour');
        const tour = await Tour.findById(req.params.id);
        if (tour) {
          title = `${tour.title} | Trips for Ukraine`;
          description = tour.description?.slice(0, 160);
          image = tour.images?.[0] || '';
        }
      } else if (req.params.slug) {
        const Destination = require('./models/Destination');
        const dest = await Destination.findOne({ slug: req.params.slug });
        if (dest) {
          title = `${dest.nameUk} | Trips for Ukraine`;
          description = `Відкрийте для себе ${dest.nameUk} з Trips for Ukraine. ${dest.description?.slice(0, 100)}`;
        }
      }

      // Inject meta tags into HTML with robust regex
      let modifiedHtml = indexHtml
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
        .replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/, `<meta name="description" content="${description}" />`)
        // Open Graph
        .replace(/<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/, `<meta property="og:title" content="${title}" />`)
        .replace(/<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/, `<meta property="og:description" content="${description}" />`)
        .replace(/<meta\s+property="og:image"\s+content="[\s\S]*?"\s*\/?>/, `<meta property="og:image" content="${image}" />`);

      res.send(modifiedHtml);
    } catch (error) {
      res.send(indexHtml);
    }
  });

  // Fallback for other routes
  app.get('*', (req, res) => {
    res.send(indexHtml);
  });
}

const PORT = process.env.PORT || 5051;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
