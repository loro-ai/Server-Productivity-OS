const express = require('express')
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  updateProgress,
} = require('../controllers/projects.controller')

const router = express.Router()

router.get('/', getProjects)
router.post('/', createProject)
router.patch('/:id', updateProject)
router.delete('/:id', deleteProject)
router.patch('/:id/progress', updateProgress)

module.exports = router
