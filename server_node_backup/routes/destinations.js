const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/destinations
// @desc    Get all destinations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ popularityScore: -1 });
    res.json(destinations);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   GET /api/destinations/:slug
// @desc    Get destination by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const destination = await Destination.findOne({ slug: req.params.slug });
    
    if (!destination) {
      return res.status(404).json({ message: 'Напрямок не знайдено' });
    }
    
    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   POST /api/destinations
// @desc    Create new destination
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const destination = await Destination.create(req.body);
    res.status(201).json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   PUT /api/destinations/:id
// @desc    Update destination
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!destination) {
      return res.status(404).json({ message: 'Напрямок не знайдено' });
    }
    
    res.json(destination);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   DELETE /api/destinations/:id
// @desc    Delete destination
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);
    
    if (!destination) {
      return res.status(404).json({ message: 'Напрямок не знайдено' });
    }
    
    res.json({ message: 'Напрямок видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

module.exports = router;
