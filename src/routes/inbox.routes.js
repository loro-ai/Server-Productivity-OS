const express = require('express')
const {
  getInbox,
  createInboxItem,
  convertInboxItem,
  deleteInboxItem,
} = require('../controllers/inbox.controller')

const router = express.Router()

router.get('/', getInbox)
router.post('/', createInboxItem)
router.patch('/:id/convert', convertInboxItem)
router.delete('/:id', deleteInboxItem)

module.exports = router
