const mongoose = require('mongoose')

// Modelo de tarea con prioridad, estado y referencia a proyecto
const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'El título es requerido'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['alta', 'media', 'baja'],
      default: 'media',
    },
    status: {
      type: String,
      enum: ['pending', 'done'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    // Fecha en que se completó la tarea (para streak)
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Task', taskSchema)
