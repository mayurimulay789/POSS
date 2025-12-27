const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
  // merchant optional for development; in production this should be required and set from auth
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
