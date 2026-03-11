const Task = require('../models/Task')
const User = require('../models/User')

// Actualizar streak del usuario al completar una tarea
const updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId)
    if (!user) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null
    if (lastActive) lastActive.setHours(0, 0, 0, 0)

    const todayStr = today.toISOString().split('T')[0]
    const lastStr = lastActive ? lastActive.toISOString().split('T')[0] : null

    if (lastStr === todayStr) {
      // Ya fue activo hoy, no cambiar streak
      return
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastStr === yesterdayStr) {
      // Actividad consecutiva: incrementar streak
      await User.findByIdAndUpdate(userId, {
        streak: user.streak + 1,
        lastActiveDate: new Date(),
      })
    } else {
      // Se rompió la racha: reiniciar a 1
      await User.findByIdAndUpdate(userId, {
        streak: 1,
        lastActiveDate: new Date(),
      })
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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
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

    // Toggle entre pending y done
    const newStatus = task.status === 'pending' ? 'done' : 'pending'
    task.status = newStatus
    task.completedAt = newStatus === 'done' ? new Date() : null
    await task.save()

    // Actualizar streak si se completó la tarea
    if (newStatus === 'done') {
      await updateStreak(req.user.id)
    }

    res.json(task)
  } catch (error) {
    next(error)
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask, completeTask }
