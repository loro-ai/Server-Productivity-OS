const jwt = require('jsonwebtoken')

// Middleware de autenticación JWT
// Verifica el token en el header Authorization: Bearer <token>
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  // V-12: el token viaja en el header Authorization, nunca en cookies ni body
  // Si en el futuro se migra a httpOnly cookies, este middleware se actualiza aquí
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' })
    }
    return res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = authMiddleware
