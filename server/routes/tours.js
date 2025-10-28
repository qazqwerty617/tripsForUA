const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/tours
// @desc    Get all tours
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { destination, status, featured, dateFrom, dateTo } = req.query;
    const query = {};
    
    if (destination) query.destination = destination;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';
    
    // Date range filter: filter by startDate within [dateFrom, dateTo]
    if (dateFrom || dateTo) {
      query.startDate = {}
      if (dateFrom) query.startDate.$gte = new Date(dateFrom)
      if (dateTo) query.startDate.$lte = new Date(dateTo)
    }

    const tours = await Tour.find(query)
      .populate('destination')
      .sort({ startDate: 1 });
    
    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   GET /api/tours/:id
// @desc    Get tour by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id).populate('destination');
    
    if (!tour) {
      return res.status(404).json({ message: 'Тур не знайдено' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   POST /api/tours
// @desc    Create new tour
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    const populatedTour = await Tour.findById(tour._id).populate('destination');
    res.status(201).json(populatedTour);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   PUT /api/tours/:id
// @desc    Update tour
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('destination');
    
    if (!tour) {
      return res.status(404).json({ message: 'Тур не знайдено' });
    }
    
    res.json(tour);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   DELETE /api/tours/:id
// @desc    Delete tour
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    
    if (!tour) {
      return res.status(404).json({ message: 'Тур не знайдено' });
    }
    
    res.json({ message: 'Тур видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

module.exports = router;
