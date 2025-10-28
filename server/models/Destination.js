const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  nameUk: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true
  },
  flag: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  gallery: [{
    type: String
  }],
  continent: {
    type: String,
    enum: ['Europe', 'Asia', 'Africa', 'North America', 'South America', 'Oceania'],
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  popularityScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Destination', destinationSchema);
