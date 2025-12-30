const mongoose = require('mongoose');

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ').toLowerCase();

const MenuCategorySchema = new mongoose.Schema({
  // Original casing is kept in `name`; duplicates are prevented using `normalizedName`.
  name: { type: String, required: true },
  normalizedName: { type: String, required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', default: null },
  // merchant is optional for development/testing; ideally this should be populated from auth middleware
  merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdAt: { type: Date, default: Date.now }
});

MenuCategorySchema.pre('validate', function() {
  const safeName = (this.name || '').trim().replace(/\s+/g, ' ');
  this.name = safeName;
  this.normalizedName = normalizeName(safeName);
});

MenuCategorySchema.index(
  { normalizedName: 1, parent: 1, merchant: 1 },
  {
    unique: true,
    name: 'unique_category_per_parent_merchant',
    partialFilterExpression: { normalizedName: { $exists: true } }
  }
);

module.exports = mongoose.model('MenuCategory', MenuCategorySchema);
