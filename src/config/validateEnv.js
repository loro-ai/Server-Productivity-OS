// Validación de variables de entorno al arrancar el servidor
// Previene iniciar la app con secretos faltantes o inseguros

const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET']

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`❌ Variable de entorno requerida no definida: ${key}`)
      console.error('   Copia .env.example a server/.env y completa los valores.')
      process.exit(1)
    }
  }

  if (process.env.JWT_SECRET === 'REEMPLAZAR_con_64_bytes_aleatorios_en_hex') {
    console.error('❌ JWT_SECRET tiene el valor placeholder del .env.example.')
    console.error('   Genera uno real con: node -e "require(\'crypto\').randomBytes(64).toString(\'hex\')|console.log"')
    process.exit(1)
  }

  if (process.env.JWT_SECRET.length < 64) {
    console.error('❌ JWT_SECRET demasiado corto. Usa al menos 64 caracteres.')
    process.exit(1)
  }
}

module.exports = validateEnv
