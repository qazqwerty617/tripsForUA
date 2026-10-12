const express = require('express');
const router = express.Router();
const Tour = require('../models/Tour');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/tours
// @desc    Get all tours
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { destination, status, featured, from, to } = req.query;
    const query = {};

    if (destination) query.destination = destination;
    if (status) query.status = status;
    if (featured) query.featured = featured === 'true';

    console.log('🔍 Tours query params:', { from, to });

    let tours = await Tour.find(query)
      .populate('destination')
      .sort({ order: 1, featured: -1, startDate: 1 }); // Order first, then featured, then by date

    // Date range filter: check if any date in availableDates OR startDate is within range
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      if (toDate) toDate.setHours(23, 59, 59, 999);

      tours = tours.filter(tour => {
        // Якщо у туру немає фіксованих дат (під запит / будь-які дати) — він доступний на будь-які дати
        const hasFixedDates = tour.hasFixedDates === true || (tour.hasFixedDates !== false && Array.isArray(tour.availableDates) && tour.availableDates.length > 0);
        if (!hasFixedDates) return true;

        // Get all dates to check (availableDates if present, else startDate)
        const datesToCheck = tour.availableDates && tour.availableDates.length > 0
          ? tour.availableDates.filter(d => d && !isNaN(new Date(d).getTime()) && new Date(d).getFullYear() > 2000)
          : (tour.startDate && !isNaN(new Date(tour.startDate).getTime()) && new Date(tour.startDate).getFullYear() > 2000 ? [tour.startDate] : []);

        // Якщо фіксованих дат немає — доступний завжди
        if (datesToCheck.length === 0) return true;

        // Check if any date falls within the range
        return datesToCheck.some(date => {
          const d = new Date(date);
          d.setHours(0, 0, 0, 0);

          if (fromDate && toDate) {
            return d >= fromDate && d <= toDate;
          }
          if (fromDate) return d >= fromDate;
          if (toDate) return d <= toDate;
          return true;
        });
      });
    }

    console.log('✅ Found tours:', tours.length, tours.map(t => ({
      title: t.title,
      startDate: t.startDate,
      availableDates: t.availableDates
    })));

    res.json(tours);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   PUT /api/tours/reorder
// @desc    Reorder tours
// @access  Private/Admin
router.put('/reorder', protect, admin, async (req, res) => {
  try {
    const { orderedIds } = req.body;

    // Update order for each tour
    const updates = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index }
      }
    }));

    await Tour.bulkWrite(updates);

    res.json({ message: 'Порядок оновлено' });
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
