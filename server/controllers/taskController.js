// const Task = require('../models/Task');
// const User = require('../models/User'); // Add this import
// const mongoose = require('mongoose');

// /**
//  * ============================
//  * HELPER: ASSIGNMENT PERMISSION
//  * ============================
//  */
// const canAssignTask = ({ assignerRole, assignerId, assigneeId, assigneeRole }) => {
//   // Self-assign always allowed
//   if (assignerId.toString() === assigneeId.toString()) {
//     return true;
//   }

//   const rules = {
//     merchant: ['manager', 'supervisor', 'staff'],
//     manager: ['manager', 'supervisor', 'staff'],
//     supervisor: ['supervisor', 'staff'],
//     staff: []
//   };

//   return rules[assignerRole]?.includes(assigneeRole);
// };

// /**
//  * ============================
//  * CREATE TASK
//  * ============================
//  */
// exports.createTask = async (req, res) => {
//   try {
//     console.log('Create task request body:', req.body);
//     const {
//       taskName,
//       taskMessage,
//       assignedTo,
//       dueDate,
//       priority,
//       category,
//       estimatedTime,
//       taskDurationType,
//       customFrequency
//     } = req.body;

//     if (!taskName || !assignedTo) {
//       return res.status(400).json({
//         success: false,
//         message: 'Task name and assigned user are required'
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid assigned user'
//       });
//     }

//     // Fix: Use the imported User model instead of req.app.locals.User
//     const assignee = await User.findById(assignedTo).select('role');
//     if (!assignee) {
//       return res.status(404).json({
//         success: false,
//         message: 'Assigned user not found'
//       });
//     }

//     const allowed = canAssignTask({
//       assignerRole: req.user.role,
//       assignerId: req.user._id,
//       assigneeId: assignedTo,
//       assigneeRole: assignee.role
//     });

//     if (!allowed) {
//       return res.status(403).json({
//         success: false,
//         message: 'You are not allowed to assign task to this user'
//       });
//     }

//     const task = await Task.create({
//       taskName,
//       taskMessage,
//       assignedBy: req.user._id,
//       assignedTo,
//       dueDate,
//       priority,
//       category,
//       estimatedTime,
//       taskDurationType,
//       customFrequency
//     });

//     // Optionally populate the task before sending response
//     const populatedTask = await Task.findById(task._id)
//       .populate('assignedTo', 'FullName role')
//       .populate('assignedBy', 'FullName role');

//     res.status(201).json({
//       success: true,
//       data: populatedTask,
//       message: 'Task created successfully'
//     });

//   } catch (error) {
//     console.error('Create task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while creating task'
//     });
//   }
// };

// /**
//  * ============================
//  * GET ALL TASKS
//  * ============================
//  */
// exports.getAllTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find()
//       .populate('assignedTo', 'FullName role')
//       .populate('assignedBy', 'FullName role')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: tasks.length,
//       data: tasks
//     });

//   } catch (error) {
//     console.error('Get all tasks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching tasks'
//     });
//   }
// };

// /**
//  * ============================
//  * GET MY TASKS (ASSIGNED TO ME)
//  * ============================
//  */
// exports.getMyTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ assignedTo: req.user._id })
//       .populate('assignedTo', 'FullName role')
//       .populate('assignedBy', 'FullName role')
//       .sort({ dueDate: 1 });

//     res.status(200).json({
//       success: true,
//       count: tasks.length,
//       data: tasks
//     });

//   } catch (error) {
//     console.error('Get my tasks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching my tasks'
//     });
//   }
// };

// /**
//  * ============================
//  * GET TASKS ASSIGNED BY ME
//  * ============================
//  */
// exports.getAssignedTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({ assignedBy: req.user._id })
//       .populate('assignedTo', 'FullName role')
//       .populate('assignedBy', 'FullName role')
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: tasks.length,
//       data: tasks
//     });

//   } catch (error) {
//     console.error('Get assigned tasks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching assigned tasks'
//     });
//   }
// };

// /**
//  * ============================
//  * GET MY PENDING TASKS
//  * ============================
//  */
// exports.getMyPendingTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({
//       assignedTo: req.user._id,
//       status: 'pending'
//     })
//     .populate('assignedTo', 'FullName role')
//     .populate('assignedBy', 'FullName role')
//     .sort({ dueDate: 1 });

//     res.status(200).json({
//       success: true,
//       count: tasks.length,
//       data: tasks
//     });

//   } catch (error) {
//     console.error('Get pending tasks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching pending tasks'
//     });
//   }
// };

// /**
//  * ============================
//  * GET MY COMPLETED TASKS
//  * ============================
//  */
// exports.getMyCompletedTasks = async (req, res) => {
//   try {
//     const tasks = await Task.find({
//       assignedTo: req.user._id,
//       status: 'completed'
//     })
//     .populate('assignedTo', 'FullName role')
//     .populate('assignedBy', 'FullName role')
//     .sort({ completedTime: -1 });

//     res.status(200).json({
//       success: true,
//       count: tasks.length,
//       data: tasks
//     });

//   } catch (error) {
//     console.error('Get completed tasks error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching completed tasks'
//     });
//   }
// };

// /**
//  * ============================
//  * GET SINGLE TASK
//  * ============================
//  */
// exports.getTaskById = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id)
//       .populate('assignedTo', 'FullName role')
//       .populate('assignedBy', 'FullName role');

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: task
//     });

//   } catch (error) {
//     console.error('Get task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching task'
//     });
//   }
// };

// /**
//  * ============================
//  * UPDATE TASK
//  * ============================
//  */
// exports.updateTask = async (req, res) => {
//   try {
//     let task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     // Only assignedBy or assignedTo or merchant can update
//     if (
//       req.user.role !== 'merchant' &&
//       task.assignedBy.toString() !== req.user._id.toString() &&
//       task.assignedTo.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to update this task'
//       });
//     }

//     Object.assign(task, req.body);

//     if (req.body.status === 'completed') {
//       task.completedTime = new Date();
//     }

//     await task.save();

//     // Populate the task before sending response
//     const populatedTask = await Task.findById(task._id)
//       .populate('assignedTo', 'FullName role')
//       .populate('assignedBy', 'FullName role');

//     res.status(200).json({
//       success: true,
//       data: populatedTask,
//       message: 'Task updated successfully'
//     });

//   } catch (error) {
//     console.error('Update task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while updating task'
//     });
//   }
// };

// /**
//  * ============================
//  * DELETE TASK
//  * ============================
//  */
// exports.deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id);

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     // Only assignedBy or merchant can delete
//     if (
//       req.user.role !== 'merchant' &&
//       task.assignedBy.toString() !== req.user._id.toString()
//     ) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to delete this task'
//       });
//     }

//     await task.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: 'Task deleted successfully'
//     });

//   } catch (error) {
//     console.error('Delete task error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while deleting task'
//     });
//   }
// };



const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

/**
 * ============================
 * HELPER: ASSIGNMENT PERMISSION
 * ============================
 */
const canAssignTask = ({ assignerRole, assignerId, assigneeId, assigneeRole }) => {
  // Self-assign always allowed
  if (assignerId.toString() === assigneeId.toString()) {
    return true;
  }

  const rules = {
    merchant: ['manager', 'supervisor', 'staff'],
    manager: ['manager', 'supervisor', 'staff'],
    supervisor: ['supervisor', 'staff'],
    staff: []
  };

  return rules[assignerRole]?.includes(assigneeRole);
};

/**
 * ============================
 * CREATE TASK
 * ============================
 */
exports.createTask = async (req, res) => {
  try {
    console.log('Create task request body:', req.body);
    const {
      taskName,
      taskMessage,
      assignedTo,
      dueDate,
      priority,
      category,
      estimatedTime,
      taskDurationType,
      customFrequency
    } = req.body;

    if (!taskName || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Task name and assigned user are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assigned user'
      });
    }

    const assignee = await User.findById(assignedTo).select('role');
    if (!assignee) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    const allowed = canAssignTask({
      assignerRole: req.user.role,
      assignerId: req.user._id,
      assigneeId: assignedTo,
      assigneeRole: assignee.role
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to assign task to this user'
      });
    }

    const task = await Task.create({
      taskName,
      taskMessage,
      assignedBy: req.user._id,
      assignedTo,
      dueDate,
      priority,
      category,
      estimatedTime,
      taskDurationType,
      customFrequency
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'FullName role')
      .populate('assignedBy', 'FullName role');

    res.status(201).json({
      success: true,
      data: populatedTask,
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
};

/**
 * ============================
 * GET ALL TASKS (with role-based filtering)
 * ============================
 */
exports.getAllTasks = async (req, res) => {
  try {
    let query = {};
    
    // Role-based filtering
    if (req.user.role !== 'merchant') {
      // For non-merchant users, only show tasks they're involved with
      query = {
        $or: [
          { assignedTo: req.user._id },
          { assignedBy: req.user._id }
        ]
      };
    }
    
    // Additional filtering for managers and supervisors
    if (req.user.role === 'manager') {
      // Manager can see tasks of managers, supervisors, and staff
      // This is already handled by the $or query above
    }
    
    if (req.user.role === 'supervisor') {
      // Supervisor can see tasks of supervisors and staff
      // This is already handled by the $or query above
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'FullName role')
      .populate('assignedBy', 'FullName role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });

  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

/**
 * ============================
 * GET MY TASKS (ASSIGNED TO ME)
 * ============================
 */
exports.getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'FullName role')
      .populate('assignedBy', 'FullName role')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });

  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching my tasks'
    });
  }
};

/**
 * ============================
 * GET TASKS ASSIGNED BY ME
 * ============================
 */
exports.getAssignedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedBy: req.user._id })
      .populate('assignedTo', 'FullName role')
      .populate('assignedBy', 'FullName role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });

  } catch (error) {
    console.error('Get assigned tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching assigned tasks'
    });
  }
};

/**
 * ============================
 * GET MY PENDING TASKS
 * ============================
 */
exports.getMyPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      status: 'pending'
    })
    .populate('assignedTo', 'FullName role')
    .populate('assignedBy', 'FullName role')
    .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });

  } catch (error) {
    console.error('Get pending tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending tasks'
    });
  }
};

/**
 * ============================
 * GET MY COMPLETED TASKS
 * ============================
 */
exports.getMyCompletedTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
      status: 'completed'
    })
    .populate('assignedTo', 'FullName role')
    .populate('assignedBy', 'FullName role')
    .sort({ completedTime: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });

  } catch (error) {
    console.error('Get completed tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching completed tasks'
    });
  }
};

/**
 * ============================
 * GET SINGLE TASK
 * ============================
 */
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'FullName role')
      .populate('assignedBy', 'FullName role');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Authorization check for viewing task
    if (req.user.role !== 'merchant') {
      if (task.assignedTo._id.toString() !== req.user._id.toString() && 
          task.assignedBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this task'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
};

/**
 * ============================
 * UPDATE TASK
 * ============================
 */
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only assignedBy or assignedTo or merchant can update
    if (
      req.user.role !== 'merchant' &&
      task.assignedBy.toString() !== req.user._id.toString() &&
      task.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    Object.assign(task, req.body);

    if (req.body.status === 'completed') {
      task.completedTime = new Date();
    }

    await task.save();

    // Populate the task before sending response
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'FullName role')
      .populate('assignedBy', 'FullName role');

    res.status(200).json({
      success: true,
      data: populatedTask,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
};

/**
 * ============================
 * DELETE TASK
 * ============================
 */
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Only assignedBy or merchant can delete
    if (
      req.user.role !== 'merchant' &&
      task.assignedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
};