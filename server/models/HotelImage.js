const mongoose = require('mongoose');

const HotelImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    title: { type: String, default: '' },
    alt: { type: String, default: '' },
    // Banner configuration for landing page
    isBanner: { type: Boolean, default: false },
    bannerHeading: { type: String, default: '' },
    bannerOrder: { type: Number, default: 0 },
    // Welcome section image
    isWelcome: { type: Boolean, default: false },
    // Cuisine Gallery background image
    isCuisineGallery: { type: Boolean, default: false },
    // Show in Cuisine Gallery cards
    isCuisineCard: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HotelImage', HotelImageSchema);
