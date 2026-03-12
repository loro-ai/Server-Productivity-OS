/**
 * Script de migración: asigna role='admin' a alexis.vega.311@gmail.com
 * Uso: node scripts/setAdmin.js
 * Solo se necesita correr una vez.
 */
require('dotenv').config()
const mongoose = require('mongoose')
const User = require('../src/models/User')

const ADMIN_EMAIL = 'alexis.vega.311@gmail.com'

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ MongoDB conectado')

  const result = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    { role: 'admin' },
    { new: true }
  )

  if (!result) {
    console.error(`❌ Usuario no encontrado: ${ADMIN_EMAIL}`)
    console.error('   Verifica que el email esté registrado en la BD.')
    process.exit(1)
  }

  console.log(`✅ Role 'admin' asignado a: ${result.email}`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
