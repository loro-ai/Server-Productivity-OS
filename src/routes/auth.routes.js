const express = require('express')
const { register, login } = require('../controllers/auth.controller')

const router = express.Router()

// Rutas de autenticación (sin protección JWT)
router.post('/register', register)
router.post('/login', login)

module.exports = router
