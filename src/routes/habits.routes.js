const express = require('express')
const {
  getHabits,
  createHabit,
  toggleHabit,
  deleteHabit,
  resetWeek,
} = require('../controllers/habits.controller')

const router = express.Router()

router.get('/', getHabits)
router.post('/', createHabit)
router.patch('/:id/toggle', toggleHabit)
router.delete('/:id', deleteHabit)
router.post('/reset-week', resetWeek)

module.exports = router
