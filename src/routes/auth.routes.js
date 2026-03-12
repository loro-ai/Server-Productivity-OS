const express = require('express')
const rateLimit = require('express-rate-limit')
const { register, login } = require('../controllers/auth.controller')

const router = express.Router()

// Limita a 10 intentos por IP cada 15 minutos
// Previene fuerza bruta en login y registro masivo de cuentas
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos, por favor intenta de nuevo en 15 minutos' },
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)

module.exports = router
