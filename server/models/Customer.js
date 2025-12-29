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
    required: [true, 'Customer email is required'],
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
    required: [true, 'Customer phone number is required'],
    trim: true,
    match: [
      /^[0-9]{10,15}$/,
      'Please provide a valid phone number (10-15 digits)'
    ]
  },
  
  // Address Information
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'Street address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
      maxlength: [50, 'Country cannot exceed 50 characters']
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
    }
  },
  
  // Membership Information
  membership_id: {
    type: String,
    unique: true,
    sparse: true,
    default: null
  },
  
  membership_validity: {
    type: Date,
    default: null
  },
  
  membership_type: {
    type: String,
    enum: ['none', 'basic', 'premium', 'gold', 'platinum'],
    default: 'none'
  },
  
  membership_created_date: {
    type: Date,
    default: null
  },
  
  // Customer Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'blocked'],
    default: 'active'
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

// Virtual for checking if membership is valid
customerSchema.virtual('is_membership_valid').get(function() {
  if (!this.membership_validity) return false;
  const today = new Date();
  const validityDate = new Date(this.membership_validity);
  return validityDate > today;
});

// Pre-save middleware to generate membership ID - SIMPLIFIED AND FIXED
customerSchema.pre('save', async function () {
  console.log('Pre-save middleware triggered for customer:', this.cust_name);
  console.log('Membership type:', this.membership_type);

  if (this.membership_type !== 'none' && !this.membership_id) {
    console.log('Generating membership ID for type:', this.membership_type);

    try {
      const prefix = this.membership_type.charAt(0).toUpperCase();
      const year = new Date().getFullYear().toString().slice(-2);
      const timestamp = Date.now().toString().slice(-4);
      const randomNum = Math.floor(1000 + Math.random() * 9000);

      const membershipId = `${prefix}${year}${timestamp}${randomNum}`;

      const existingCustomer = await mongoose
        .model('Customer')
        .findOne({ membership_id: membershipId });

      this.membership_id = existingCustomer
        ? `${prefix}${year}${timestamp}${Math.floor(1000 + Math.random() * 9000)}`
        : membershipId;

      if (!this.membership_created_date) {
        this.membership_created_date = new Date();
      }

      if (!this.membership_validity) {
        const validityDate = new Date();
        validityDate.setFullYear(validityDate.getFullYear() + 1);
        this.membership_validity = validityDate;
      }

    } catch (error) {
      console.error('Error in pre-save middleware:', error);
      this.membership_id = `TEMP-${Date.now()}`;
    }
  } else {
    console.log(
      'Skipping membership ID generation. Type:',
      this.membership_type,
      'ID exists:',
      !!this.membership_id
    );
  }
});


// Remove the problematic findOneAndUpdate middleware for now
// We can add it back later if needed
// customerSchema.pre('findOneAndUpdate', async function(next) {
//   // Remove this middleware for now to avoid complexity
//   next();
// });

// Static method to check if email exists
customerSchema.statics.emailExists = async function(email) {
  try {
    const customer = await this.findOne({ email: email.toLowerCase() });
    return !!customer;
  } catch (error) {
    console.error('Error checking email exists:', error);
    return false;
  }
};

// Static method to check if phone exists
customerSchema.statics.phoneExists = async function(phone) {
  try {
    const customer = await this.findOne({ phone });
    return !!customer;
  } catch (error) {
    console.error('Error checking phone exists:', error);
    return false;
  }
};

// Static method to generate membership ID
customerSchema.statics.generateMembershipId = async function(membershipType) {
  try {
    const prefix = membershipType.charAt(0).toUpperCase();
    const year = new Date().getFullYear().toString().slice(-2);
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    const membershipId = `${prefix}${year}${timestamp}${randomNum}`;
    
    // Check if this ID already exists
    const existingCustomer = await this.findOne({ membership_id: membershipId });
    if (existingCustomer) {
      // If exists, try one more time with different random number
      const newRandomNum = Math.floor(1000 + Math.random() * 9000);
      return `${prefix}${year}${timestamp}${newRandomNum}`;
    }
    
    return membershipId;
  } catch (error) {
    console.error('Error generating membership ID:', error);
    return `TEMP-${Date.now()}`;
  }
};

// Method to renew membership
customerSchema.methods.renewMembership = async function(months = 12) {
  try {
    if (!this.membership_validity) {
      // If no existing validity, set from now
      const newDate = new Date();
      newDate.setMonth(newDate.getMonth() + months);
      this.membership_validity = newDate;
    } else {
      // Extend existing validity
      const currentValidity = new Date(this.membership_validity);
      currentValidity.setMonth(currentValidity.getMonth() + months);
      this.membership_validity = currentValidity;
    }
    
    return this.save();
  } catch (error) {
    console.error('Error renewing membership:', error);
    throw error;
  }
};

// Indexes for better query performance
customerSchema.index({ email: 1 }, { unique: true });
customerSchema.index({ phone: 1 });
customerSchema.index({ membership_id: 1 }, { unique: true, sparse: true });
customerSchema.index({ createdBy: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ membership_type: 1 });
customerSchema.index({ 'address.city': 1 });
customerSchema.index({ 'address.pincode': 1 });
customerSchema.index({ createdBy: 1, status: 1 });
customerSchema.index({ createdBy: 1, membership_type: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;