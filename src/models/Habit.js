const mongoose = require('mongoose')

// Modelo de hábito con datos semanales de completado
const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    emoji: {
      type: String,
      default: '✅',
    },
    // Array de registros diarios: fecha + si fue completado
    weekData: [
      {
        date: { type: Date },
        completed: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Habit', habitSchema)
