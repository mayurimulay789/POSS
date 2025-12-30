const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  // Basic Information
  cust_name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  
  phone: {
    type: String,
    trim: true,
    match: [
      /^[0-9]{10,15}$/,
      'Please provide a valid phone number (10-15 digits)'
    ]
  },
  membership_id: {
    type: String,
    default: null
  },
  
  // Created By (User who added the customer)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

 module.exports = mongoose.model('Customer', customerSchema);