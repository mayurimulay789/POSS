const mongoose = require('mongoose');

const chargeSchema = new mongoose.Schema({
  // Charge Information
  chargeName: {
    type: String,
    required: [true, 'Charge name is required'],
    trim: true,
    maxlength: [50, 'Charge name cannot exceed 50 characters'],
    unique: true
  },
  
  // Charge Type: percentage or fixed amount
  chargeType: {
    type: String,
    required: [true, 'Charge type is required'],
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  
  // Value: percentage (e.g., 5, 10) or fixed amount (e.g., 50, 100)
  value: {
    type: Number,
    required: [true, 'Charge value is required'],
    min: [0, 'Charge value cannot be negative']
  },
  
  // Only two categories: systemcharge or optionalcharge
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['systemcharge', 'optionalcharge'],
    default: 'optionalcharge'
  },
  
  // Active status (admin can toggle)
  active: {
    type: Boolean,
    default: true
  },
  
  // Created by (for audit trail)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true
});

// Virtual field for display value
chargeSchema.virtual('displayValue').get(function() {
  return this.chargeType === 'percentage' ? `${this.value}%` : `₹${this.value}`;
});

const Charge = mongoose.model('Charge', chargeSchema);

module.exports = Charge;