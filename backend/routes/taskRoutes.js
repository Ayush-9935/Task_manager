const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/stats/dashboard')
  .get(protect, getDashboardStats);

router.route('/')
  .get(protect, getTasks)
  .post(protect, authorize('Admin'), createTask);

router.route('/:id')
  .get(protect, getTask)
  .put(protect, updateTask)
  .delete(protect, authorize('Admin'), deleteTask);

module.exports = router;
