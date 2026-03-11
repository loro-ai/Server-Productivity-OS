const express = require('express')
const { getSummary, exportData } = require('../controllers/dashboard.controller')

const router = express.Router()

// Resumen del dashboard
router.get('/summary', getSummary)

// Exportar todos los datos del usuario
router.get('/export', exportData)

module.exports = router
