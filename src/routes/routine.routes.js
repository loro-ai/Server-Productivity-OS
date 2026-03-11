const express = require('express')
const {
  getRoutine,
  updateRoutineItems,
  logRoutine,
  getTodayLog,
} = require('../controllers/routine.controller')

const router = express.Router()

router.get('/:type', getRoutine)
router.patch('/:type/items', updateRoutineItems)
router.post('/:type/log', logRoutine)
router.get('/:type/log/today', getTodayLog)

module.exports = router
