const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${Date.now()}_${base}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Непідтримуваний формат файлу'));
  }
});

// POST /api/upload - admin only
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  try {
    const filename = req.file.filename;
    const urlPath = `/uploads/${filename}`;
    // Full URL hint
    const fullUrl = `${req.protocol}://${req.get('host')}${urlPath}`;
    res.json({ path: urlPath, url: fullUrl, filename });
  } catch (error) {
    res.status(500).json({ message: 'Помилка завантаження', error: error.message });
  }
});

module.exports = router;
