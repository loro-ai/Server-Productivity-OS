const mongoose = require('mongoose')

// Modelo de bandeja de entrada: captura rápida de ideas
const inboxSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'El texto es requerido'],
      trim: true,
    },
    // Si ya fue procesado (convertido a tarea o proyecto)
    processed: {
      type: Boolean,
      default: false,
    },
    // A qué fue convertido: 'task', 'project' o null
    convertedTo: {
      type: String,
      enum: ['task', 'project', null],
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Inbox', inboxSchema)
