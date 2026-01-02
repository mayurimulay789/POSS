// controllers/dashboardController.js
const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const Task = require('../models/Task');
const User = require('../models/User');
const Order = require('../models/Order');

// Helper functions for date ranges
const getTodayDateRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getThisWeekRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setDate(now.getDate() + (6 - now.getDay())); // Saturday
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const getThisMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Helper function to calculate growth percentage
const calculateGrowth = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous * 100).toFixed(1);
};

// Helper to get last period (previous month/week)
const getLastMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ======================================================================
// 1. MERCHANT DASHBOARD CONTROLLER
// ======================================================================
exports.getMerchantDashboard = async (req, res) => {
  try {
    const merchantId = req.user._id;
    
    // Get date ranges
    const todayRange = getTodayDateRange();
    const weekRange = getThisWeekRange();
    const monthRange = getThisMonthRange();
    const lastMonthRange = getLastMonthRange();
    
    // 1. Get all users created by this merchant
    const totalEmployees = await User.countDocuments({ createdBy: merchantId });
    const activeEmployees = await User.countDocuments({ 
      createdBy: merchantId, 
      isActive: true 
    });
    
    // 2. Get all customers created by merchant's users
    // First get all user IDs created by this merchant
    const merchantUsers = await User.find({ createdBy: merchantId }).select('_id');
    const merchantUserIds = merchantUsers.map(user => user._id);
    
    // Add merchant's own ID for customers they created directly
    merchantUserIds.push(merchantId);
    
    // Get customer stats
    const totalCustomers = await Customer.countDocuments({ 
      createdBy: { $in: merchantUserIds }
    });
    
    const activeCustomers = await Customer.countDocuments({ 
      createdBy: { $in: merchantUserIds },
      status: 'active'
    });
    
    // Get customers added today
    const newCustomersToday = await Customer.countDocuments({
      createdBy: { $in: merchantUserIds },
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    // Get customers added this week
    const newCustomersThisWeek = await Customer.countDocuments({
      createdBy: { $in: merchantUserIds },
      createdAt: { $gte: weekRange.start, $lte: weekRange.end }
    });
    
    // 3. Get membership stats
    const membershipStats = await Customer.aggregate([
      { 
        $match: { 
          createdBy: { $in: merchantUserIds },
          membership_type: { $ne: 'none' }
        }
      },
      {
        $group: {
          _id: '$membership_type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format membership stats
    const membershipBreakdown = {};
    let totalWithMembership = 0;
    membershipStats.forEach(stat => {
      membershipBreakdown[stat._id] = stat.count;
      totalWithMembership += stat.count;
    });
    
    // Get expired memberships
    const expiredMemberships = await Customer.countDocuments({
      createdBy: { $in: merchantUserIds },
      membership_type: { $ne: 'none' },
      membership_validity: { $lt: new Date() }
    });
    
    // 4. Get expense stats
    const totalExpensesResult = await Expense.aggregate([
      { $match: { createdBy: { $in: merchantUserIds } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].totalAmount : 0;
    
    const expensesThisMonth = await Expense.aggregate([
      { 
        $match: { 
          createdBy: { $in: merchantUserIds },
          date: { $gte: monthRange.start, $lte: monthRange.end }
        }
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const expensesToday = await Expense.aggregate([
      { 
        $match: { 
          createdBy: { $in: merchantUserIds },
          date: { $gte: todayRange.start, $lte: todayRange.end }
        }
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    // 5. Get task stats
    const totalTasks = await Task.countDocuments({ 
      assignedBy: { $in: merchantUserIds }
    });
    
    const completedTasks = await Task.countDocuments({ 
      assignedBy: { $in: merchantUserIds },
      status: 'completed'
    });
    
    const pendingTasks = await Task.countDocuments({ 
      assignedBy: { $in: merchantUserIds },
      status: 'pending'
    });
    
    const overdueTasks = await Task.countDocuments({ 
      assignedBy: { $in: merchantUserIds },
      status: 'pending',
      dueDate: { $lt: new Date() }
    });
    
    // 6. Get employee role distribution
    const roleDistribution = await User.aggregate([
      { $match: { createdBy: merchantId } },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const roleDistributionObj = {};
    roleDistribution.forEach(role => {
      roleDistributionObj[role._id] = role.count;
    });
    
    // 7. Calculate trends (simplified - using last month as comparison)
    const lastMonthCustomers = await Customer.countDocuments({
      createdBy: { $in: merchantUserIds },
      createdAt: { $gte: lastMonthRange.start, $lte: lastMonthRange.end }
    });
    
    const customerGrowth = calculateGrowth(newCustomersThisWeek, lastMonthCustomers);
    
    // 8. Recent activity (last 5 activities from each model)
    const recentCustomers = await Customer.find({ 
      createdBy: { $in: merchantUserIds }
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('cust_name email membership_type createdAt');
    
    const recentExpenses = await Expense.find({ 
      createdBy: { $in: merchantUserIds }
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate('createdBy', 'FullName')
    .select('title amount date createdBy');
    
    const recentActivity = [
      ...recentCustomers.map(customer => ({
        type: 'customer_created',
        message: `New customer ${customer.cust_name} added`,
        timestamp: customer.createdAt
      })),
      ...recentExpenses.map(expense => ({
        type: 'expense_added',
        message: `₹${expense.amount} expense added by ${expense.createdBy.FullName}`,
        timestamp: expense.date
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    //order stats -total orders and todays orders
     //order stats only total order and today's order count
    const totalOrders = await Order.countDocuments({
    });
    const todaysOrders = await Order.countDocuments({
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    // 9. Payment method distribution for expenses
    const expenseByPaymentMethod = await Expense.aggregate([
      { $match: { createdBy: { $in: merchantUserIds } } },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const paymentMethodStats = {};
    expenseByPaymentMethod.forEach(method => {
      paymentMethodStats[method._id] = {
        amount: method.totalAmount,
        count: method.count
      };
    });
    
    // Construct response
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalExpenses,
          expensesToday: expensesToday.length > 0 ? expensesToday[0].totalAmount : 0,
          expensesThisMonth: expensesThisMonth.length > 0 ? expensesThisMonth[0].totalAmount : 0,
          netProfit: 0, // Placeholder - need revenue model
          profitMargin: "0%" // Placeholder
        },
        
        customerStats: {
          totalCustomers,
          activeCustomers,
          newCustomersToday,
          newCustomersThisWeek,
          membershipStats: {
            totalWithMembership,
            membershipBreakdown,
            expiredMemberships,
            membershipRevenue: 0 // Placeholder
          }
      },
      orderStats: {
          totalOrders,
          todaysOrders
      },
        
        employeeStats: {
          totalEmployees,
          activeEmployees,
          roleDistribution: roleDistributionObj,
          newEmployeesThisMonth: 0 // Placeholder
        },
        
        financialStats: {
          totalExpenses,
          expensesByPaymentMethod: paymentMethodStats,
          expensesThisMonth: expensesThisMonth.length > 0 ? expensesThisMonth[0].totalAmount : 0,
          expensesToday: expensesToday.length > 0 ? expensesToday[0].totalAmount : 0,
          averageDailyExpense: totalExpenses / 30 // Simple average
        },
        
        taskStats: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) + '%' : '0%'
        },
        
        trends: {
          customerGrowth: `${customerGrowth}%`,
          expenseGrowth: '0%', // Placeholder
          membershipGrowth: '0%' // Placeholder
        },
        
        recentActivity
      },
      message: 'Merchant dashboard data fetched successfully'
    });
    
  } catch (error) {
    console.error('Merchant dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching merchant dashboard'
    });
  }
};

// ======================================================================
// 2. MANAGER DASHBOARD CONTROLLER
// ======================================================================
exports.getManagerDashboard = async (req, res) => {
  try {
    const managerId = req.user._id;
    
    // Get date ranges
    const todayRange = getTodayDateRange();
    const weekRange = getThisWeekRange();
    
    // 1. Get all users under this manager (created by same merchant)
    const currentUser = await User.findById(managerId);
    const merchantId = currentUser.createdBy || managerId;
    
    const teamUsers = await User.find({ 
      createdBy: merchantId,
      role: { $in: ['manager', 'supervisor', 'staff'] }
    }).select('_id FullName role');
    
    const teamUserIds = teamUsers.map(user => user._id);
    
    // 2. Get customer stats for the team
    const totalCustomers = await Customer.countDocuments({ 
      createdBy: { $in: teamUserIds }
    });
    
    const customersAddedToday = await Customer.countDocuments({
      createdBy: { $in: teamUserIds },
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    const customersAddedThisWeek = await Customer.countDocuments({
      createdBy: { $in: teamUserIds },
      createdAt: { $gte: weekRange.start, $lte: weekRange.end }
    });
    
    // 3. Get membership stats
    const membershipStats = await Customer.aggregate([
      { 
        $match: { 
          createdBy: { $in: teamUserIds },
          membership_type: { $ne: 'none' }
        }
      },
      {
        $group: {
          _id: null,
          totalWithMembership: { $sum: 1 },
          expiringThisWeek: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$membership_validity', null] },
                    { $gte: ['$membership_validity', new Date()] },
                    { $lte: ['$membership_validity', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const renewalsNeeded = await Customer.countDocuments({
      createdBy: { $in: teamUserIds },
      membership_type: { $ne: 'none' },
      membership_validity: { $lt: new Date() }
    });
    
    // 4. Get expense stats
    const totalExpensesResult = await Expense.aggregate([
      { $match: { createdBy: { $in: teamUserIds } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const totalExpenses = totalExpensesResult.length > 0 ? totalExpensesResult[0].totalAmount : 0;
    
    const expensesTodayResult = await Expense.aggregate([
      { 
        $match: { 
          createdBy: { $in: teamUserIds },
          date: { $gte: todayRange.start, $lte: todayRange.end }
        }
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const expensesThisWeekResult = await Expense.aggregate([
      { 
        $match: { 
          createdBy: { $in: teamUserIds },
          date: { $gte: weekRange.start, $lte: weekRange.end }
        }
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    // 5. Get task stats
    const teamTasks = await Task.countDocuments({ 
      assignedBy: { $in: teamUserIds }
    });
    
    const teamCompletedTasks = await Task.countDocuments({ 
      assignedBy: { $in: teamUserIds },
      status: 'completed'
    });
    
    const teamPendingTasks = await Task.countDocuments({ 
      assignedBy: { $in: teamUserIds },
      status: 'pending'
    });
    
    const teamOverdueTasks = await Task.countDocuments({ 
      assignedBy: { $in: teamUserIds },
      status: 'pending',
      dueDate: { $lt: new Date() }
    });
    
    // 6. Get my personal tasks
    const myAssignedTasks = await Task.countDocuments({ assignedTo: managerId });
    const myPendingTasks = await Task.countDocuments({ 
      assignedTo: managerId, 
      status: 'pending' 
    });
    const myDueTodayTasks = await Task.countDocuments({
      assignedTo: managerId,
      status: 'pending',
      dueDate: { 
        $gte: todayRange.start, 
        $lte: todayRange.end 
      }
    });
    
    // 7. Get expense by payment method
    const expenseByPaymentMethod = await Expense.aggregate([
      { $match: { createdBy: { $in: teamUserIds } } },
      {
        $group: {
          _id: '$paymentMethod',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    const paymentMethodStats = {};
    expenseByPaymentMethod.forEach(method => {
      paymentMethodStats[method._id] = method.totalAmount;
    });

    //order stats only total order and today's order count
    const totalOrders = await Order.countDocuments({
    });
    const todaysOrders = await Order.countDocuments({
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });

    
    // 8. Get upcoming deadlines
    const expiringMemberships = await Customer.find({
      createdBy: { $in: teamUserIds },
      membership_type: { $ne: 'none' },
      membership_validity: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    .limit(5)
    .select('cust_name membership_type membership_validity');
    
    const dueTasks = await Task.find({
      assignedBy: { $in: teamUserIds },
      status: 'pending',
      dueDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    })
    .populate('assignedTo', 'FullName')
    .limit(5)
    .select('taskName dueDate assignedTo');
    
    const upcomingDeadlines = [
      ...expiringMemberships.map(member => ({
        type: 'membership_expiry',
        customer: member.cust_name,
        date: member.membership_validity,
        daysLeft: Math.ceil((member.membership_validity - new Date()) / (1000 * 60 * 60 * 24))
      })),
      ...dueTasks.map(task => ({
        type: 'task_due',
        task: task.taskName,
        date: task.dueDate,
        assignee: task.assignedTo.FullName,
        daysLeft: Math.ceil((task.dueDate - new Date()) / (1000 * 60 * 60 * 24))
      }))
    ].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);
    
    // Construct response
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalExpenses,
          expensesToday: expensesTodayResult.length > 0 ? expensesTodayResult[0].totalAmount : 0,
          expensesThisWeek: expensesThisWeekResult.length > 0 ? expensesThisWeekResult[0].totalAmount : 0,
          budgetUtilization: '0%' // Placeholder
        },
        
        customerStats: {
          totalCustomers,
          customersAddedToday,
          customersAddedThisWeek,
          membershipStats: {
            totalWithMembership: membershipStats.length > 0 ? membershipStats[0].totalWithMembership : 0,
            expiringThisWeek: membershipStats.length > 0 ? membershipStats[0].expiringThisWeek : 0,
            renewalsNeeded
          }
        },
        
        
        teamStats: {
          teamSize: teamUsers.length,
          tasksAssigned: teamTasks,
          tasksCompleted: teamCompletedTasks,
          tasksOverdue: teamOverdueTasks,
          teamPerformance: teamTasks > 0 ? ((teamCompletedTasks / teamTasks) * 100).toFixed(1) + '%' : '0%'
        },
        
        taskStats: {
          myAssignedTasks,
          teamTasks,
          pendingTasks: teamPendingTasks,
          highPriorityTasks: 0, // Placeholder
          dueToday: myDueTodayTasks
        },
        

        
        expenseStats: {
          totalExpenses,
          expensesByPaymentMethod: paymentMethodStats,
          topExpenseCategories: [] // Placeholder - need expense categories
        },
        orderStats: {
          totalOrders,
          todaysOrders
        },
        
        upcomingDeadlines
      },
      message: 'Manager dashboard data fetched successfully'
    });
    
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching manager dashboard'
    });
  }
};

// ======================================================================
// 3. SUPERVISOR DASHBOARD CONTROLLER
// ======================================================================
exports.getSupervisorDashboard = async (req, res) => {
  try {
    const supervisorId = req.user._id;
    
    // Get date ranges
    const todayRange = getTodayDateRange();
    
    // 1. Get my team (staff under this supervisor)
    const currentUser = await User.findById(supervisorId);
    const merchantId = currentUser.createdBy || supervisorId;
    
    // Get all staff created by same merchant
    const allStaff = await User.find({ 
      createdBy: merchantId,
      role: 'staff'
    }).select('_id FullName');
    
    // For now, assume supervisor manages all staff
    // In real app, you might have a separate assignment model
    const teamMembers = allStaff;
    const teamMemberIds = teamMembers.map(member => member._id);
    
    // 2. Get my personal stats
    const myExpensesResult = await Expense.aggregate([
      { $match: { createdBy: supervisorId } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const myExpenses = myExpensesResult.length > 0 ? myExpensesResult[0].totalAmount : 0;
    
    const myExpensesTodayResult = await Expense.aggregate([
      { 
        $match: { 
          createdBy: supervisorId,
          date: { $gte: todayRange.start, $lte: todayRange.end }
        }
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const myExpensesToday = myExpensesTodayResult.length > 0 ? myExpensesTodayResult[0].totalAmount : 0;
    
    // 3. Get team expense stats
    const teamExpensesResult = await Expense.aggregate([
      { $match: { createdBy: { $in: teamMemberIds } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const teamExpenses = teamExpensesResult.length > 0 ? teamExpensesResult[0].totalAmount : 0;
    
    // 4. Get customer stats
    const customersAddedByMe = await Customer.countDocuments({ createdBy: supervisorId });
    
    const customersAddedByTeam = await Customer.countDocuments({ 
      createdBy: { $in: teamMemberIds }
    });
    
    const newCustomersToday = await Customer.countDocuments({
      $or: [
        { createdBy: supervisorId },
        { createdBy: { $in: teamMemberIds } }
      ],
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    const membershipConversions = await Customer.countDocuments({
      $or: [
        { createdBy: supervisorId },
        { createdBy: { $in: teamMemberIds } }
      ],
      membership_type: { $ne: 'none' }
    });
    
    // 5. Get task stats
    const myTasks = await Task.countDocuments({ assignedTo: supervisorId });
    const myPendingTasks = await Task.countDocuments({ 
      assignedTo: supervisorId, 
      status: 'pending' 
    });
    const myCompletedTasks = await Task.countDocuments({ 
      assignedTo: supervisorId, 
      status: 'completed' 
    });
    const myOverdueTasks = await Task.countDocuments({ 
      assignedTo: supervisorId, 
      status: 'pending',
      dueDate: { $lt: new Date() }
    });
    
    const tasksAssignedByMe = await Task.countDocuments({ assignedBy: supervisorId });
    const teamTasksAssignedByMe = await Task.countDocuments({ 
      assignedBy: supervisorId,
      assignedTo: { $in: teamMemberIds }
    });
    
    const teamTasksCompleted = await Task.countDocuments({ 
      assignedBy: supervisorId,
      assignedTo: { $in: teamMemberIds },
      status: 'completed'
    });
    
    const teamTasksPending = await Task.countDocuments({ 
      assignedBy: supervisorId,
      assignedTo: { $in: teamMemberIds },
      status: 'pending'
    });

    //order my total orders and today's orders
    const totalOrders = await Order.countDocuments({
      createdBy: supervisorId
    });
    const todaysOrders = await Order.countDocuments({
      createdBy: supervisorId,
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });

    
    // 6. Daily stats
    const dailyExpenses = await Expense.countDocuments({
      createdBy: supervisorId,
      date: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    const dailyTasksCompleted = await Task.countDocuments({
      assignedTo: supervisorId,
      status: 'completed',
      completedTime: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    const dailyTasksCreated = await Task.countDocuments({
      assignedBy: supervisorId,
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    // Construct response
    res.status(200).json({
      success: true,
      data: {
        overview: {
          myExpenses,
          teamExpenses,
          expensesToday: myExpensesToday,
          expenseLimitUsed: '0%' // Placeholder
        },
        
        customerStats: {
          customersAddedByMe,
          customersAddedByTeam,
          newCustomersToday,
          membershipConversions
        },
        
        teamStats: {
          teamMembers: teamMembers.length,
          tasksAssignedToTeam: teamTasksAssignedByMe,
          teamTasksCompleted,
          teamTasksPending,
          teamPerformance: teamTasksAssignedByMe > 0 ? 
            ((teamTasksCompleted / teamTasksAssignedByMe) * 100).toFixed(1) + '%' : '0%'
        },
        
        orderStats: {
          totalOrders,
          todaysOrders
        },
        
        taskStats: {
          myTasks: {
            total: myTasks,
            pending: myPendingTasks,
            completed: myCompletedTasks,
            overdue: myOverdueTasks
          },
          teamTasks: {
            assignedByMe: tasksAssignedByMe,
            pending: teamTasksPending,
            completed: teamTasksCompleted
          },
        },
        
        dailyStats: {
          customersAdded: newCustomersToday,
          expensesAdded: dailyExpenses,
          tasksCompleted: dailyTasksCompleted,
          tasksCreated: dailyTasksCreated
        },
        
        performanceMetrics: {
          customerSatisfaction: '0%', // Placeholder
          taskCompletionRate: myTasks > 0 ? ((myCompletedTasks / myTasks) * 100).toFixed(1) + '%' : '0%',
          expenseEfficiency: 'Good' // Placeholder
        },
        
        quickActions: [
          'create_task',
          'add_customer',
          'add_expense',
          'view_reports'
        ]
      },
      message: 'Supervisor dashboard data fetched successfully'
    });
    
  } catch (error) {
    console.error('Supervisor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supervisor dashboard'
    });
  }
};

// ======================================================================
// 4. STAFF DASHBOARD CONTROLLER
// ======================================================================
exports.getStaffDashboard = async (req, res) => {
  try {
    const staffId = req.user._id;
    
    // Get date ranges
    const todayRange = getTodayDateRange();
    const weekRange = getThisWeekRange();
    
    // 1. Get expense stats
    const myExpensesTodayResult = await Expense.aggregate([
      { 
        $match: { 
          createdBy: staffId,
          date: { $gte: todayRange.start, $lte: todayRange.end }
        }
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const myExpensesToday = myExpensesTodayResult.length > 0 ? myExpensesTodayResult[0].totalAmount : 0;
    
    const myExpensesThisWeekResult = await Expense.aggregate([
      { 
        $match: { 
          createdBy: staffId,
          date: { $gte: weekRange.start, $lte: weekRange.end }
        }
      },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    
    const myExpensesThisWeek = myExpensesThisWeekResult.length > 0 ? myExpensesThisWeekResult[0].totalAmount : 0;
    
    // 2. Get customer stats
    const customersAddedByMe = await Customer.countDocuments({ createdBy: staffId });
    const customersAddedToday = await Customer.countDocuments({
      createdBy: staffId,
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    const membershipsSold = await Customer.countDocuments({
      createdBy: staffId,
      membership_type: { $ne: 'none' }
    });

    //order stats - total orders and today's orders
    const totalOrders = await Order.countDocuments({
      createdBy: staffId
    });
    const todaysOrders = await Order.countDocuments({
      createdBy: staffId,
      createdAt: { $gte: todayRange.start, $lte: todayRange.end }
    });

    
    // 3. Get task stats
    const assignedTasks = await Task.countDocuments({ assignedTo: staffId });
    const completedTasks = await Task.countDocuments({ 
      assignedTo: staffId,
      status: 'completed'
    });
    const pendingTasks = await Task.countDocuments({ 
      assignedTo: staffId,
      status: 'pending'
    });
    const overdueTasks = await Task.countDocuments({ 
      assignedTo: staffId,
      status: 'pending',
      dueDate: { $lt: new Date() }
    });
    const dueTodayTasks = await Task.countDocuments({
      assignedTo: staffId,
      status: 'pending',
      dueDate: { 
        $gte: todayRange.start, 
        $lte: todayRange.end 
      }
    });
    
    // 4. Calculate average completion time
    const completedTasksData = await Task.find({
      assignedTo: staffId,
      status: 'completed',
      assignedTime: { $exists: true },
      completedTime: { $exists: true }
    }).select('assignedTime completedTime');
    
    let totalCompletionTime = 0;
    completedTasksData.forEach(task => {
      const completionTime = (task.completedTime - task.assignedTime) / (1000 * 60 * 60); // hours
      totalCompletionTime += completionTime;
    });
    
    const averageCompletionTime = completedTasksData.length > 0 ? 
      (totalCompletionTime / completedTasksData.length).toFixed(1) + ' hours' : 'N/A';
    
    // 5. Today's summary
    const expensesToSubmit = await Expense.countDocuments({
      createdBy: staffId,
      date: { $gte: todayRange.start, $lte: todayRange.end }
    });
    
    // 6. Recent activity
    const recentTasks = await Task.find({
      assignedTo: staffId,
      status: 'completed'
    })
    .sort({ completedTime: -1 })
    .limit(3)
    .select('taskName completedTime');
    
    const recentCustomers = await Customer.find({
      createdBy: staffId
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('cust_name createdAt');
    
    const recentExpenses = await Expense.find({
      createdBy: staffId
    })
    .sort({ date: -1 })
    .limit(3)
    .select('title amount date');
    
    const recentActivity = [
      ...recentTasks.map(task => ({
        type: 'task_completed',
        task: task.taskName,
        time: formatTimeAgo(task.completedTime)
      })),
      ...recentCustomers.map(customer => ({
        type: 'customer_added',
        customer: customer.cust_name,
        time: formatTimeAgo(customer.createdAt)
      })),
      ...recentExpenses.map(expense => ({
        type: 'expense_submitted',
        amount: expense.amount,
        time: formatTimeAgo(expense.date)
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Helper function to format time ago
    function formatTimeAgo(date) {
      const now = new Date();
      const diff = now - new Date(date);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      
      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      } else if (hours < 24) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      }
    }
    
    // Construct response
    res.status(200).json({
      success: true,
      data: {
        overview: {
          myExpensesToday,
          myExpensesThisWeek,
          expenseLimitRemaining: 0, // Placeholder
          workHours: '0/8' // Placeholder
        },
        orderStats: {
          totalOrders,
          todaysOrders
        },
        
        customerStats: {
          customersAddedByMe,
          customersAddedToday,
          membershipsSold,
          customerRetention: '0%' // Placeholder
        },
        
        taskStats: {
          assignedTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          dueToday: dueTodayTasks,
          completionRate: assignedTasks > 0 ? ((completedTasks / assignedTasks) * 100).toFixed(1) + '%' : '0%'
        },
        
        performance: {
          tasksCompleted: completedTasks,
          averageCompletionTime,
          productivityScore: assignedTasks > 0 ? ((completedTasks / assignedTasks) * 100).toFixed(1) + '%' : '0%',
          attendance: '0%' // Placeholder
        },
        
        todaySummary: {
          tasksToComplete: dueTodayTasks,
          customersToFollowUp: 0, // Placeholder
          expensesToSubmit,
          meetings: 0 // Placeholder
        },
        
        recentActivity,
        
        quickStats: {
          streakDays: 0, // Placeholder
          rating: 0, // Placeholder
          rewards: 0 // Placeholder
        }
      },
      message: 'Staff dashboard data fetched successfully'
    });
    
  } catch (error) {
    console.error('Staff dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff dashboard'
    });
  }
};
