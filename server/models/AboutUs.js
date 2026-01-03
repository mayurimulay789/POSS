const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const valueSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const statSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true
  },
  value: {
    type: String,
    required: true,
    trim: true
  },
  detail: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  }
});

const aboutUsSchema = new mongoose.Schema({
  // Main content
  yearEstablished: {
    type: String,
    default: '1985'
  },
  mainTitle: {
    type: String,
    default: 'About Us'
  },
  mainDescription: {
    type: String,
    default: '',
    trim: true
  },
  
  // Highlights section
  highlights: [highlightSchema],
  
  // Values section
  values: [valueSchema],
  
  // Stats section
  stats: [statSchema],
  
  // House rhythm section
  rhythmTitle: {
    type: String,
    default: 'Paced for real conversations'
  },
  rhythmDescription: {
    type: String,
    trim: true
  },
  rhythmQuote: {
    type: String,
    trim: true
  },
  
  // Meta data
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one active About Us document exists
aboutUsSchema.pre('save', async function() {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
});

const AboutUs = mongoose.model('AboutUs', aboutUsSchema);

module.exports = AboutUs;
