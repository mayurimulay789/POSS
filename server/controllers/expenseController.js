// const Expense = require('../models/Expense');
// const mongoose = require('mongoose');

// // @desc    Create new expense
// // @route   POST /api/expenses
// // @access  Private (staff, supervisor, manager, merchant)
// const createExpense = async (req, res) => {
//   try {
//     const { title, amount, description, paymentMethod } = req.body;

//     console.log('Create expense request body:', req.body);

//     // Validation
//     if (!title || !amount) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Please provide title and amount' 
//       });
//     }

//     if (amount <= 0) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Amount must be greater than 0' 
//       });
//     }

//     // Create expense with current date
//     const expense = await Expense.create({
//       title,
//       amount,
//       description,
//       createdBy: req.user._id,
//       paymentMethod: paymentMethod || 'cash',
//       date: new Date(),
//       isEditable: true
//     });

//     res.status(201).json({
//       success: true,
//       data: expense,
//       message: 'Expense created successfully'
//     });

//   } catch (error) {
//     console.error('Create expense error:', error);
    
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false,
//         message: messages.join(', ') 
//       });
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error while creating expense' 
//     });
//   }
// };

// // @desc    Get all expenses (Only for merchant and manager)
// // @route   GET /api/expenses
// // @access  Private (merchant, manager)
// const getExpenses = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, startDate, endDate, search } = req.query;
//     const skip = (page - 1) * limit;

//     // Build query - merchant/manager can see ALL expenses
//     let query = {};

//     // Date range filter
//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) query.date.$gte = new Date(startDate);
//       if (endDate) query.date.$lte = new Date(endDate);
//     }

//     // Search filter
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Execute query with pagination
//     const expenses = await Expense.find(query)
//       .populate('createdBy', 'FullName email role')
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Expense.countDocuments(query);
//     const totalPages = Math.ceil(total / limit);

//     // Calculate total amount
//     const totalAmountResult = await Expense.aggregate([
//       { $match: query },
//       { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
//     ]);
    
//     const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

//     res.status(200).json({
//       success: true,
//       count: expenses.length,
//       total,
//       totalAmount,
//       pagination: {
//         current: parseInt(page),
//         pages: totalPages,
//         total,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       data: expenses
//     });

//   } catch (error) {
//     console.error('Get all expenses error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error while fetching expenses' 
//     });
//   }
// };

// // @desc    Get my expenses (for staff, supervisor, manager, merchant)
// // @route   GET /api/expenses/my-expenses
// // @access  Private (staff, supervisor, manager, merchant)
// const getMyExpenses = async (req, res) => {
//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const skip = (page - 1) * limit;

//     // User can only see their own expenses
//     const query = { createdBy: req.user._id };

//     const expenses = await Expense.find(query)
//       .sort({ date: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Expense.countDocuments(query);
//     const totalPages = Math.ceil(total / limit);

//     // Calculate total amount of user's expenses
//     const totalAmountResult = await Expense.aggregate([
//       { $match: query },
//       { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
//     ]);
    
//     const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

//     res.status(200).json({
//       success: true,
//       count: expenses.length,
//       total,
//       totalAmount,
//       pagination: {
//         current: parseInt(page),
//         pages: totalPages,
//         total,
//         hasNext: page < totalPages,
//         hasPrev: page > 1
//       },
//       data: expenses
//     });

//   } catch (error) {
//     console.error('Get my expenses error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error while fetching your expenses' 
//     });
//   }
// };

// // @desc    Get single expense
// // @route   GET /api/expenses/:id
// // @access  Private (user can only view their own expense)
// const getExpense = async (req, res) => {
//   try {
//     const expense = await Expense.findById(req.params.id)
//       .populate('createdBy', 'FullName email role');

//     if (!expense) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Expense not found' 
//       });
//     }

//     // Check if user is authorized to view this expense
//     // Users can only view their own expenses
//     if (expense.createdBy._id.toString() !== req.user._id.toString()) {
//       // Merchant can view any expense
//       if (req.user.role !== 'merchant') {
//         return res.status(403).json({ 
//           success: false,
//           message: 'Not authorized to view this expense' 
//         });
//       }
//     }

//     res.status(200).json({
//       success: true,
//       data: expense
//     });

//   } catch (error) {
//     console.error('Get expense error:', error);
    
//     if (error.kind === 'ObjectId') {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Expense not found' 
//       });
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error while fetching expense' 
//     });
//   }
// };

// // @desc    Update expense
// // @route   PUT /api/expenses/:id
// // @access  Private (only creator can update before midnight, merchant anytime)
// const updateExpense = async (req, res) => {
//   try {
//     // Check if user can modify this expense
//     const { canModify, expense, reason } = await Expense.canModify(
//       req.params.id, 
//       req.user._id, 
//       req.user.role
//     );

//     if (!canModify) {
//       return res.status(403).json({ 
//         success: false,
//         message: reason || 'Not authorized to update this expense'
//       });
//     }

//     // Update allowed fields
//     const { title, amount, description, paymentMethod } = req.body;
    
//     if (title !== undefined) expense.title = title;
//     if (amount !== undefined) {
//       if (amount <= 0) {
//         return res.status(400).json({ 
//           success: false,
//           message: 'Amount must be greater than 0' 
//         });
//       }
//       expense.amount = amount;
//     }
//     if (description !== undefined) expense.description = description;
//     if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;

//     await expense.save();

//     // Populate before returning
//     const updatedExpense = await Expense.findById(expense._id)
//       .populate('createdBy', 'FullName email role');

//     res.status(200).json({
//       success: true,
//       data: updatedExpense,
//       message: 'Expense updated successfully'
//     });

//   } catch (error) {
//     console.error('Update expense error:', error);
    
//     if (error.kind === 'ObjectId') {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Expense not found' 
//       });
//     }
    
//     if (error.name === 'ValidationError') {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({ 
//         success: false,
//         message: messages.join(', ') 
//       });
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error while updating expense' 
//     });
//   }
// };

// // @desc    Delete expense
// // @route   DELETE /api/expenses/:id
// // @access  Private (only creator can delete before midnight, merchant anytime)
// const deleteExpense = async (req, res) => {
//   try {
//     // Check if user can modify this expense
//     const { canModify, expense, reason } = await Expense.canModify(
//       req.params.id, 
//       req.user._id, 
//       req.user.role
//     );

//     if (!canModify) {
//       return res.status(403).json({ 
//         success: false,
//         message: reason || 'Not authorized to delete this expense'
//       });
//     }

//     await expense.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: 'Expense deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete expense error:', error);
    
//     if (error.kind === 'ObjectId') {
//       return res.status(404).json({ 
//         success: false,
//         message: 'Expense not found' 
//       });
//     }
    
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error while deleting expense' 
//     });
//   }
// };

// // Helper function to check if date is same day (before midnight)
// const isSameDay = (date1, date2) => {
//   return date1.getDate() === date2.getDate() && 
//          date1.getMonth() === date2.getMonth() && 
//          date1.getFullYear() === date2.getFullYear();
// };

// module.exports = {
//   createExpense,
//   getExpenses,
//   getExpense,
//   updateExpense,
//   deleteExpense,
//   getMyExpenses
// };

const Expense = require('../models/Expense');
const mongoose = require('mongoose');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (staff, supervisor, manager, merchant)
const createExpense = async (req, res) => {
  try {
    const { title, amount, description, paymentMethod } = req.body;

    console.log('Create expense request body:', req.body);
    console.log('User creating expense:', req.user._id);

    // Validation
    if (!title || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide title and amount' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be greater than 0' 
      });
    }

    // Create expense with current date
    const expenseData = {
      title,
      amount: parseFloat(amount),
      description,
      createdBy: req.user._id,
      paymentMethod: paymentMethod || 'cash',
      date: new Date(),
      isEditable: true
    };

    console.log('Creating expense with data:', expenseData);

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });

  } catch (error) {
    console.error('Create expense error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating expense',
      error: error.message 
    });
  }
};

// @desc    Get all expenses (Only for merchant and manager)
// @route   GET /api/expenses
// @access  Private (merchant, manager)
const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, search } = req.query;
    const skip = (page - 1) * limit;

    // Build query - merchant/manager can see ALL expenses
    let query = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const expenses = await Expense.find(query)
      .populate('createdBy', 'FullName email role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate total amount
    const totalAmountResult = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalAmount,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: expenses
    });

  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching expenses' 
    });
  }
};

// @desc    Get my expenses (for staff, supervisor, manager, merchant)
// @route   GET /api/expenses/my-expenses
// @access  Private (staff, supervisor, manager, merchant)
const getMyExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, search } = req.query;
    const skip = (page - 1) * limit;

    // User can only see their own expenses
    let query = { createdBy: req.user._id };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('createdBy', 'FullName email role')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Calculate total amount of user's expenses
    const totalAmountResult = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const totalAmount = totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

    res.status(200).json({
      success: true,
      count: expenses.length,
      total,
      totalAmount,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      data: expenses
    });

  } catch (error) {
    console.error('Get my expenses error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching your expenses' 
    });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private (user can only view their own expense, merchant can view all)
const getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'FullName email role');

    if (!expense) {
      return res.status(404).json({ 
        success: false,
        message: 'Expense not found' 
      });
    }

    // Check if user is authorized to view this expense
    // Users can only view their own expenses unless they are merchant
    if (expense.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'merchant') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this expense' 
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error('Get expense error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Expense not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching expense' 
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (only creator can update before midnight, merchant anytime)
const updateExpense = async (req, res) => {
  try {
    // Check if user can modify this expense
    const { canModify, expense, reason } = await Expense.canModify(
      req.params.id, 
      req.user._id, 
      req.user.role
    );

    if (!canModify) {
      return res.status(403).json({ 
        success: false,
        message: reason || 'Not authorized to update this expense'
      });
    }

    // Update allowed fields
    const { title, amount, description, paymentMethod } = req.body;
    
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Amount must be greater than 0' 
        });
      }
      expense.amount = amount;
    }
    if (description !== undefined) expense.description = description;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;

    await expense.save();

    // Populate before returning
    const updatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'FullName email role');

    res.status(200).json({
      success: true,
      data: updatedExpense,
      message: 'Expense updated successfully'
    });

  } catch (error) {
    console.error('Update expense error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Expense not found' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating expense' 
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (only creator can delete before midnight, merchant anytime)
const deleteExpense = async (req, res) => {
  try {
    // Check if user can modify this expense
    const { canModify, expense, reason } = await Expense.canModify(
      req.params.id, 
      req.user._id, 
      req.user.role
    );

    if (!canModify) {
      return res.status(403).json({ 
        success: false,
        message: reason || 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ 
        success: false,
        message: 'Expense not found' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting expense' 
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  getMyExpenses
};