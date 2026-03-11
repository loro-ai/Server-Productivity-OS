const mongoose = require('mongoose')

// Registro diario de qué ítems de rutina fueron completados
const routineLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    routineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Routine',
      required: true,
    },
    // Fecha en formato 'YYYY-MM-DD' para facilitar búsquedas por día
    date: {
      type: String,
      required: true,
    },
    // IDs de los ítems completados ese día
    completedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true }
)

// Índice único: un log por rutina por día por usuario
routineLogSchema.index({ userId: 1, routineId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('RoutineLog', routineLogSchema)
