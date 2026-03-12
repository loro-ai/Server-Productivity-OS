const mongoose = require('mongoose')

// Conexión a MongoDB con manejo de errores
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Opciones recomendadas para Mongoose 8+
    })
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
