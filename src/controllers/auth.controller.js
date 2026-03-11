const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Generar token JWT con datos del usuario
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' })
    }

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ message: 'El email ya está registrado' })
    }

    // Hashear contraseña con bcryptjs (sin compilación nativa)
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = await User.create({ name, email, passwordHash })
    const token = generateToken(user)

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak },
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
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak },
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { register, login }
