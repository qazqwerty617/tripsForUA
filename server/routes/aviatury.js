const express = require('express');
const router = express.Router();
const Aviatur = require('../models/Aviatur');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/aviatury
// @desc    Get all aviatury
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const query = {};

    if (status) query.status = status;

    // Фільтр по даті: показуємо тільки ті авіатури що ПОЧИНАЮТЬСЯ в обраному діапазоні
    if (from || to) {
      query.availableFrom = {};
      if (from) {
        // Авіатур повинен починатися НЕ РАНІШЕ обраної дати
        query.availableFrom.$gte = new Date(from);
      }
      if (to) {
        // І НЕ ПІЗНІШЕ обраної кінцевої дати
        query.availableFrom.$lte = new Date(to);
      }
    }

    console.log('🔍 Aviatury query params:', { status, from, to });
    console.log('📝 MongoDB query:', JSON.stringify(query, null, 2));

    const aviatury = await Aviatur.find(query).sort({ hot: -1, availableFrom: 1 });

    console.log('✅ Found aviatury:', aviatury.length, aviatury.map(a => ({
      name: a.name,
      availableFrom: a.availableFrom,
      availableTo: a.availableTo
    })));

    res.json(aviatury);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   GET /api/aviatury/:id
// @desc    Get aviatur by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const aviatur = await Aviatur.findById(req.params.id);

    if (!aviatur) {
      return res.status(404).json({ message: 'Авіатур не знайдено' });
    }

    res.json(aviatur);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   POST /api/aviatury
// @desc    Create new aviatur
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const aviatur = await Aviatur.create(req.body);
    res.status(201).json(aviatur);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   PUT /api/aviatury/:id
// @desc    Update aviatur
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const debugImage = req.body?.image;
    if (debugImage) {
      console.log(`[AVIATURY] Updating ${req.params.id} with image: ${debugImage}`);
    }
    const aviatur = await Aviatur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!aviatur) {
      return res.status(404).json({ message: 'Авіатур не знайдено' });
    }

    res.json(aviatur);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   DELETE /api/aviatury/:id
// @desc    Delete aviatur
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const aviatur = await Aviatur.findByIdAndDelete(req.params.id);

    if (!aviatur) {
      return res.status(404).json({ message: 'Авіатур не знайдено' });
    }

    res.json({ message: 'Авіатур видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

module.exports = router;
