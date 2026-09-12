const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  tourTitle: {
    type: String,
    required: true,
    trim: true
  },
  tourId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: false
  },
  travelDate: {
    type: String,
    required: true,
    trim: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  authorCity: {
    type: String,
    trim: true,
    default: ''
  },
  authorAvatar: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    required: true,
    default: 5,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  photos: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
