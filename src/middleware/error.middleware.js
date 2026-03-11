// Middleware global de manejo de errores
// Captura todos los errores no manejados y devuelve respuesta JSON uniforme
const errorMiddleware = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`)
  console.error(err.stack)

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

  // Error genérico
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    message: err.message || 'Error interno del servidor',
  })
}

module.exports = errorMiddleware
