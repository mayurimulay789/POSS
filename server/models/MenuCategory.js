const mongoose = require('mongoose');

const MenuCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', default: null },
  // merchant is optional for development/testing; ideally this should be populated from auth middleware
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MenuCategory', MenuCategorySchema);
