const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/reviews
// @desc    Get reviews (all for admin or public published)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { all, tourId } = req.query;
    const query = {};

    // If not asking for all (or not authenticated admin), return only published
    if (all !== 'true') {
      query.isPublished = true;
    }

    if (tourId) {
      query.tourId = tourId;
    }

    const reviews = await Review.find(query).sort({ order: 1, createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   PUT /api/reviews/reorder
// @desc    Reorder reviews
// @access  Private/Admin
router.put('/reorder', protect, admin, async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds must be an array' });
    }

    const updates = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index }
      }
    }));

    await Review.bulkWrite(updates);
    res.json({ message: 'Порядок оновлено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   GET /api/reviews/:id
// @desc    Get single review
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Відгук не знайдено' });
    }
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

// @route   POST /api/reviews
// @desc    Create new review
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { tourTitle, travelDate, authorName, text } = req.body;
    if (!tourTitle || !travelDate || !authorName || !text) {
      return res.status(400).json({ message: 'Будь ласка, заповніть обовʼязкові поля: назва туру, дата, автор та текст' });
    }

    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Помилка створення відгуку', error: error.message });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update review
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Відгук не знайдено' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Помилка оновлення відгуку', error: error.message });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Відгук не знайдено' });
    }
    res.json({ message: 'Відгук видалено' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка видалення відгуку', error: error.message });
  }
});

module.exports = router;
