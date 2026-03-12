// Middleware global de manejo de errores
// V-07: en producción oculta detalles internos — solo loguea en desarrollo
const errorMiddleware = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production'

  // En desarrollo loguear stack completo; en producción solo el mensaje
  if (isDev) {
    console.error(`❌ Error: ${err.message}`)
    console.error(err.stack)
  } else {
    console.error(`❌ Error: ${err.message}`)
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({ message: 'Error de validación', errors: messages })
  }

  // Error de clave duplicada en MongoDB (ej: email ya registrado)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({ message: `El campo '${field}' ya existe` })
  }

  // Error de cast (ID inválido de MongoDB)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'ID inválido' })
  }

  // Error de CORS
  if (err.message && err.message.startsWith('CORS:')) {
    return res.status(403).json({ message: 'Origen no permitido' })
  }

  // Error genérico: en producción mensaje neutro, en desarrollo el real
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    message: isDev
      ? err.message || 'Error interno del servidor'
      : statusCode < 500 ? err.message : 'Error interno del servidor',
  })
}

module.exports = errorMiddleware
