const mongoose = require('mongoose');

const FooterSchema = new mongoose.Schema({
  restaurantName: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  hours: { type: String, default: '' },
  contact: {
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  social: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
  },
  newsletterText: { type: String, default: '' },
  policyLinks: {
    privacy: { type: String, default: '' },
    terms: { type: String, default: '' },
    cookie: { type: String, default: '' },
  },
  poweredBy: { type: String, default: '' },
  isActive: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now },
}, { timestamps: true });

// Pre-save hook to ensure only one active footer
FooterSchema.pre('save', async function(next) {
  if (this.isModified('isActive') && this.isActive === true) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { $set: { isActive: false } }
    );
  }
});

module.exports = mongoose.model('Footer', FooterSchema);
