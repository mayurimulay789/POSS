const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  tableId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  tableName: {
    type: String,
    required: true
  },
  spaceType: {
    type: String,
    enum: ['Tables', 'Spa Room'],
    required: true
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    subtotal: Number
  }],
  totalBill: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'served', 'payment_pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'upi'],
    default: 'cash'
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  taxAmount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  guestCount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
orderSchema.index({ createdBy: 1, status: 1 });
orderSchema.index({ createdBy: 1, completedAt: 1 });
orderSchema.index({ orderId: 1 });

module.exports = mongoose.model('Order', orderSchema);
