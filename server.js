require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 3001

// Conectar a MongoDB y luego iniciar el servidor
const startServer = async () => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`🚀 AM · Productivity OS — Backend corriendo en puerto ${PORT}`)
    console.log(`📡 Entorno: ${process.env.NODE_ENV || 'development'}`)
  })
}

startServer()
