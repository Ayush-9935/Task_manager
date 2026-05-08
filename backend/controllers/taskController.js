const Task = require('../models/Task');
const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    let query;

    const match = {};
    
    if (req.user.role === 'Admin') {
      const myProjects = await Project.find({ createdBy: req.user.id }).select('_id');
      const myProjectIds = myProjects.map(p => p._id);
      
      if (req.query.projectId) {
        if (!myProjectIds.some(id => id.toString() === req.query.projectId)) {
           match.projectId = null;
        } else {
           match.projectId = req.query.projectId;
        }
      } else {
        match.projectId = { $in: myProjectIds };
      }
    } else {
      if (req.query.projectId) {
        match.projectId = req.query.projectId;
      }
      match.assignedTo = req.user.id;
    }

    query = Task.find(match)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name');

    const tasks = await query;

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name');

    if (!task) {
      return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    if (req.user.role !== 'Admin' && task.assignedTo._id.toString() !== req.user.id) {
      return next(new ErrorResponse(`Not authorized to view task`, 403));
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    // Check if project exists
    const project = await Project.findById(req.body.projectId);
    if (!project) {
      return next(new ErrorResponse(`No project with the id of ${req.body.projectId}`, 404));
    }

    const task = await Task.create(req.body);

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is task owner or admin
    if (task.assignedTo && task.assignedTo.toString() !== req.user.id && req.user.role !== 'Admin') {
      return next(new ErrorResponse(`Not authorized to update task`, 403));
    }

    // If Member is updating, they can ONLY update status
    if (req.user.role !== 'Admin') {
      if (req.body.title || req.body.description || req.body.priority || req.body.dueDate) {
        return next(new ErrorResponse(`Members can only update task status`, 403));
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new ErrorResponse(`Task not found with id of ${req.params.id}`, 404));
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    let match = {};
    if (req.user.role === 'Admin') {
      const myProjects = await Project.find({ createdBy: req.user.id }).select('_id');
      const myProjectIds = myProjects.map(p => p._id);
      match.projectId = { $in: myProjectIds };
    } else {
      match.assignedTo = req.user._id;
    }

    const totalTasks = await Task.countDocuments(match);
    const pendingTasks = await Task.countDocuments({ ...match, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ ...match, status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ ...match, status: 'Completed' });
    
    // Overdue tasks
    const today = new Date();
    const overdueTasks = await Task.countDocuments({ 
      ...match, 
      dueDate: { $lt: today }, 
      status: { $ne: 'Completed' } 
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks
      }
    });
  } catch (error) {
    next(error);
  }
};
