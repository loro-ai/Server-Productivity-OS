const Task = require('../models/Task')
const User = require('../models/User')

// V-16: updateStreak con operación atómica para evitar race condition
// Usa findOneAndUpdate con condición en lastActiveDate en lugar de
// dos operaciones separadas (findById + findByIdAndUpdate)
const updateStreak = async (userId) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Caso 1: ya fue activo hoy → no hacer nada
    const alreadyActiveToday = await User.findOne({
      _id: userId,
      lastActiveDate: { $gte: today },
    })
    if (alreadyActiveToday) return

    // Caso 2: actividad consecutiva (lastActiveDate fue ayer) → incrementar atómicamente
    const consecutive = await User.findOneAndUpdate(
      {
        _id: userId,
        lastActiveDate: { $gte: yesterday, $lt: today },
      },
      { $inc: { streak: 1 }, $set: { lastActiveDate: new Date() } },
      { new: true }
    )

    if (!consecutive) {
      // Caso 3: racha rota → reiniciar a 1 atómicamente
      await User.findOneAndUpdate(
        { _id: userId },
        { $set: { streak: 1, lastActiveDate: new Date() } }
      )
    }
  } catch (err) {
    console.error('Error actualizando streak:', err.message)
  }
}

// GET /api/tasks — con filtros opcionales
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, date } = req.query
    const filter = { userId: req.user.id }

    if (status) filter.status = status
    if (priority) filter.priority = priority
    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      filter.dueDate = { $gte: start, $lte: end }
    }

    const tasks = await Task.find(filter)
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

// POST /api/tasks
const createTask = async (req, res, next) => {
  try {
    const { title, priority, dueDate, projectId } = req.body

    if (!title) {
      return res.status(400).json({ message: 'El título es requerido' })
    }

    const task = await Task.create({
      userId: req.user.id,
      title,
      priority: priority || 'media',
      dueDate: dueDate || null,
      projectId: projectId || null,
    })

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    // Whitelist: solo campos que el cliente puede modificar (V-02)
    const { title, priority, dueDate, projectId, status } = req.body
    const allowedUpdate = {}

    if (title !== undefined) allowedUpdate.title = title
    if (priority !== undefined) allowedUpdate.priority = priority
    if (dueDate !== undefined) allowedUpdate.dueDate = dueDate
    if (projectId !== undefined) allowedUpdate.projectId = projectId
    if (status !== undefined) {
      allowedUpdate.status = status
      // Sincronizar completedAt al actualizar status (V-15)
      allowedUpdate.completedAt = status === 'done' ? new Date() : null
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      allowedUpdate,
      { new: true, runValidators: true }
    )

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    res.json({ message: 'Tarea eliminada' })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/tasks/:id/complete — toggle status + streak
const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id })

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' })
    }

    const newStatus = task.status === 'pending' ? 'done' : 'pending'
    task.status = newStatus
    task.completedAt = newStatus === 'done' ? new Date() : null
    await task.save()

    if (newStatus === 'done') {
      await updateStreak(req.user.id)
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask, completeTask }
