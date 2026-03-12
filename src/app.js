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

// ─── V-14: Configuracion de CORS  ─────────────

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.includes('vercel.app') || origin === 'http://localhost:5173') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))


// ─── V-12: Security headers — mitiga XSS y clickjacking ────────
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'"
  )
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// ─── V-09: Límite de tamaño en body (previene DoS) ─────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─── V-06: Multer con restricción de tipos y tamaño ────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE_MB = 5

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
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`))
    }
  },
})

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
