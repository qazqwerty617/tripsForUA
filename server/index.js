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

// Middleware
// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

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
    if (!origin || allowedOrigins.length === 0) return cb(null, true);
    return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
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
  app.use(express.static(path.join(__dirname, '../client/dist'), { maxAge: '7d', etag: true }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5051;

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на порту ${PORT}`);
});
