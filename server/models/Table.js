const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableName: {
    type: String,
    required: [true, 'Please add a table name'],
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add table capacity'],
    min: 1
  },
  spaceType: {
    type: String,
    enum: ['Tables', 'Spa Room'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'served', 'payment_pending'],
    default: 'available'
  },
  isReserved: {
    type: Boolean,
    default: false
  },
  tableImage: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1/table-placeholder.png'
  },
  orderedMenu: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  totalBill: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
tableSchema.index({ createdBy: 1, spaceType: 1 });

module.exports = mongoose.model('Table', tableSchema);
