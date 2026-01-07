const mongoose = require('mongoose');

const welcomeSectionSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one active welcome section exists
welcomeSectionSchema.pre('save', async function() {
  if (this.isModified('isActive') && this.isActive === true) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { $set: { isActive: false } }
    );
  }
});

const WelcomeSection = mongoose.model('WelcomeSection', welcomeSectionSchema);

module.exports = WelcomeSection;
