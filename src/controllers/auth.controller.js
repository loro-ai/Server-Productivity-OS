const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Generar token JWT — solo incluye el ID mínimo necesario (V-08)
// El email y name no se incluyen: el token no está cifrado y puede cambiar
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Validaciones reutilizables
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // Validar presencia de campos
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    // Validar formato de email (V-05)
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'El formato del email no es válido' })
    }

    // Validar longitud mínima de contraseña (V-05)
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` })
    }

    // Validar longitud mínima del nombre
    if (name.trim().length < 2) {
      return res.status(400).json({ message: 'El nombre debe tener al menos 2 caracteres' })
    }

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'El email ya está registrado' })
    }

    // Hashear contraseña con bcryptjs
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash })
    const token = generateToken(user)

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak, role: user.role },
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' })
    }

    // Buscar usuario por email
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' })
    }

    const token = generateToken(user)

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak, role: user.role },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login }
