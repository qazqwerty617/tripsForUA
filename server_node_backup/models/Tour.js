const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: false
  },
  country: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  fancyTitle: {
    type: String,
    trim: true,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: false
  },
  duration: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  availableDates: [{
    type: Date
  }],
  maxParticipants: {
    type: Number,
    required: true,
    default: 15
  },
  availableSpots: {
    type: Number,
    required: true
  },
  images: [{
    type: String
  }],
  highlights: [{
    type: String
  }],
  included: [{
    type: String
  }],
  notIncluded: [{
    type: String
  }],
  itinerary: [{
    day: Number,
    title: String,
    description: String
  }],
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  tourType: {
    type: String,
    enum: ['exclusive', 'package'],
    default: 'exclusive'
  },
  contactTelegram: {
    type: String,
    default: ''
  },
  contactInstagram: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tour', tourSchema);
