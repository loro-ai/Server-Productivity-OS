const Task = require('../models/Task')
const Project = require('../models/Project')
const Habit = require('../models/Habit')
const Inbox = require('../models/Inbox')
const User = require('../models/User')

// GET /api/dashboard/summary — resumen del día para el dashboard
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Rango del día actual
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Tareas de hoy (con dueDate hoy o sin fecha pero creadas hoy)
    const tasksToday = await Task.find({
      userId,
      $or: [
        { dueDate: { $gte: todayStart, $lte: todayEnd } },
        { dueDate: null, createdAt: { $gte: todayStart, $lte: todayEnd } },
      ],
    })

    const tasksDone = tasksToday.filter((t) => t.status === 'done').length
    const tasksTotal = tasksToday.length

    // Proyectos activos
    const activeProjects = await Project.countDocuments({ userId, status: 'activo' })

    // Hábitos de hoy
    const habits = await Habit.find({ userId })
    const todayStr = new Date().toISOString().split('T')[0]

    let habitsDone = 0
    for (const habit of habits) {
      const todayEntry = habit.weekData.find((d) => {
        return new Date(d.date).toISOString().split('T')[0] === todayStr
      })
      if (todayEntry && todayEntry.completed) habitsDone++
    }

    // Items sin procesar en bandeja
    const inboxUnread = await Inbox.countDocuments({ userId, processed: false })

    // Streak del usuario
    const user = await User.findById(userId).select('streak')

    res.json({
      tasksToday: { done: tasksDone, total: tasksTotal },
      activeProjects,
      habitsToday: { done: habitsDone, total: habits.length },
      inboxUnread,
      streak: user ? user.streak : 0,
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/export — exportar todos los datos del usuario en JSON
const exportData = async (req, res, next) => {
  try {
    const userId = req.user.id
    const [tasks, projects, habits, inbox, user] = await Promise.all([
      Task.find({ userId }),
      Project.find({ userId }),
      Habit.find({ userId }),
      Inbox.find({ userId }),
      User.findById(userId).select('-passwordHash'),
    ])

    res.json({
      exportedAt: new Date().toISOString(),
      user,
      tasks,
      projects,
      habits,
      inbox,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getSummary, exportData }
