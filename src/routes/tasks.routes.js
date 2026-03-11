const express = require('express')
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
} = require('../controllers/tasks.controller')

const router = express.Router()

// Todas las rutas protegidas por JWT (aplicado en app.js)
router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)
router.patch('/:id/complete', completeTask)

module.exports = router
