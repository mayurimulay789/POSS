const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  contactNo: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  googleMapLocation: {
    type: String,
    trim: true,
    default: ''
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

// Ensure only one active contact exists
contactUsSchema.pre('save', async function() {
  if (this.isModified('isActive') && this.isActive === true) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { $set: { isActive: false } }
    );
  }
});

const ContactUs = mongoose.model('ContactUs', contactUsSchema);

module.exports = ContactUs;
