const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/bookings
// @desc    Get all bookings
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('tour')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { tour, customerName, customerEmail, customerPhone, numberOfPeople, notes } = req.body;

    const tourData = await Tour.findById(tour);
    
    if (!tourData) {
      return res.status(404).json({ message: 'Тур не знайдено' });
    }

    if (tourData.availableSpots < numberOfPeople) {
      return res.status(400).json({ message: 'Недостатньо вільних місць' });
    }

    const totalPrice = tourData.price * numberOfPeople;

    const booking = await Booking.create({
      tour,
      customerName,
      customerEmail,
      customerPhone,
      numberOfPeople,
      totalPrice,
      notes
    });

    // Update available spots
    tourData.availableSpots -= numberOfPeople;
    await tourData.save();

    const populatedBooking = await Booking.findById(booking._id).populate('tour');
    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking status
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('tour');
    
    if (!booking) {
      return res.status(404).json({ message: 'Бронювання не знайдено' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

module.exports = router;
