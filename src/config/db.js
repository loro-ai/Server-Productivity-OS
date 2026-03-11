const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      tls: true,
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`)
  } catch (error) {
    console.error(`❌ Error de conexión a MongoDB: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
