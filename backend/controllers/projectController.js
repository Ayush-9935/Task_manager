const Project = require('../models/Project');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query;

    // Admin can see all, Member can see projects they are part of
    if (req.user.role === 'Admin') {
      query = Project.find({ createdBy: req.user.id }).populate('members', 'name email').populate('createdBy', 'name');
    } else {
      query = Project.find({ members: req.user.id }).populate('members', 'name email').populate('createdBy', 'name');
    }

    const projects = await query;

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email role').populate('createdBy', 'name email');

    if (!project) {
      return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    // Check if user is member or admin
    if (req.user.role !== 'Admin' && !project.members.map(m => m._id.toString()).includes(req.user.id)) {
      return next(new ErrorResponse(`Not authorized to view project`, 403));
    }

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
exports.createProject = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id;
    
    // Ensure the creator is also a member if not already
    if (!req.body.members) req.body.members = [];
    if (!req.body.members.includes(req.user.id)) {
      req.body.members.push(req.user.id);
    }

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('members', 'name email').populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new ErrorResponse(`Project not found with id of ${req.params.id}`, 404));
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
