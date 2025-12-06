const mongoose = require('mongoose');
const Destination = require('./Destination');

const aviaturSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  flag: {
    type: String,
    default: '🌍'
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: false
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  hot: {
    type: Boolean,
    default: false
  },
  duration: {
    type: String,
    default: ''
  },
  nights: {
    type: Number,
    default: 6
  },
  image: {
    type: String,
    required: true
  },
  availableFrom: {
    type: Date,
  },
  availableTo: {
    type: Date,
  },
  included: [{
    type: String
  }],
  notIncluded: [{
    type: String
  }],
  isResort: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Aviatur', aviaturSchema);
