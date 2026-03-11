const mongoose = require('mongoose')

// Modelo de proyecto con área, estado y progreso
const projectSchema = new mongoose.Schema(
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
    area: {
      type: String,
      required: [true, 'El área es requerida'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['activo', 'pausa', 'planificado'],
      default: 'activo',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Project', projectSchema)
