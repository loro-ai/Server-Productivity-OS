const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')

// Importar rutas
const authRoutes = require('./routes/auth.routes')
const tasksRoutes = require('./routes/tasks.routes')
const projectsRoutes = require('./routes/projects.routes')
const habitsRoutes = require('./routes/habits.routes')
const inboxRoutes = require('./routes/inbox.routes')
const routineRoutes = require('./routes/routine.routes')
const dashboardRoutes = require('./routes/dashboard.routes')

// Importar middlewares
const authMiddleware = require('./middleware/auth.middleware')
const errorMiddleware = require('./middleware/error.middleware')

const app = express()

// ─── Configuración de CORS ──────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)

// ─── Parseo de JSON y URL encoded ──────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Multer: configurado pero sin rutas activas (preparado para v2) ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})
// eslint-disable-next-line no-unused-vars
const upload = multer({ storage })

// ─── Rutas públicas (sin JWT) ───────────────────────────────────
app.use('/api/auth', authRoutes)

// ─── Rutas protegidas (requieren JWT) ──────────────────────────
app.use('/api/tasks', authMiddleware, tasksRoutes)
app.use('/api/projects', authMiddleware, projectsRoutes)
app.use('/api/habits', authMiddleware, habitsRoutes)
app.use('/api/inbox', authMiddleware, inboxRoutes)
app.use('/api/routine', authMiddleware, routineRoutes)
app.use('/api/dashboard', authMiddleware, dashboardRoutes)

// Ruta de exportación (alias para compatibilidad)
const { exportData } = require('./controllers/dashboard.controller')
app.get('/api/export', authMiddleware, exportData)

// ─── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Middleware de errores (debe ir al final) ───────────────────
app.use(errorMiddleware)

module.exports = app
