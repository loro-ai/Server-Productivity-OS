const mongoose = require('mongoose')

// Modelo de rutina (mañana o noche) con lista de ítems ordenados
const routineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['morning', 'night'],
      required: true,
    },
    // Ítems de la rutina con texto y orden
    items: [
      {
        text: { type: String, required: true },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
)

// Índice único: un usuario solo puede tener una rutina de cada tipo
routineSchema.index({ userId: 1, type: 1 }, { unique: true })

module.exports = mongoose.model('Routine', routineSchema)
