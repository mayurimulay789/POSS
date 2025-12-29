const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  console.log('Protect middleware invoked');
  console.log('Authorization Header:', req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User authenticated successfully:', req.user);
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-based middleware
const staff = (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as staff' });
  }
};

const manager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as manager' });
  }
};

const supervisor = (req, res, next) => {
  if (req.user && req.user.role === 'supervisor') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as supervisor' });
  }
};

const merchant = (req, res, next) => {
  if (req.user && req.user.role === 'merchant') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as merchant' });
  }
};

// Combined role middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log(`Authorization failed for role: ${req.user.role}`);
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { 
  protect, 
  staff, 
  manager, 
  supervisor, 
  merchant,
  authorize 
};