const Habit = require('../models/Habit')

// V-10: máximo de días históricos que se conservan en weekData
// Evita crecimiento ilimitado del array en MongoDB
const MAX_HISTORY_DAYS = 90

// GET /api/habits
const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: 1 })
    res.json(habits)
  } catch (error) {
    next(error)
  }
}

// POST /api/habits
const createHabit = async (req, res, next) => {
  try {
    const { name, emoji } = req.body

    if (!name) {
      return res.status(400).json({ message: 'El nombre es requerido' })
    }

    const habit = await Habit.create({
      userId: req.user.id,
      name,
      emoji: emoji || '✅',
      weekData: [],
    })

    res.status(201).json(habit)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/habits/:id/toggle — marcar/desmarcar un día específico
const toggleHabit = async (req, res, next) => {
  try {
    const { date } = req.body

    if (!date) {
      return res.status(400).json({ message: 'La fecha es requerida (YYYY-MM-DD)' })
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Formato de fecha inválido. Usa YYYY-MM-DD' })
    }

    const todayStr = new Date().toISOString().split('T')[0]

    // V-11: no permitir fechas futuras
    if (date > todayStr) {
      return res.status(400).json({ message: 'No se pueden registrar fechas futuras' })
    }

    // V-11: no permitir modificar semanas anteriores a la actual
    const now = new Date()
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - dayOfWeek + 1)
    monday.setHours(0, 0, 0, 0)
    const mondayStr = monday.toISOString().split('T')[0]

    if (date < mondayStr) {
      return res.status(400).json({ message: 'No se pueden modificar días de semanas anteriores' })
    }

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id })

    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' })
    }

    const targetDate = new Date(date + 'T12:00:00.000Z')

    const existingIndex = habit.weekData.findIndex((d) => {
      return new Date(d.date).toISOString().split('T')[0] === date
    })

    if (existingIndex >= 0) {
      habit.weekData[existingIndex].completed = !habit.weekData[existingIndex].completed
    } else {
      habit.weekData.push({ date: targetDate, completed: true })
    }

    // V-10: limpiar entradas más antiguas que MAX_HISTORY_DAYS
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_HISTORY_DAYS)
    habit.weekData = habit.weekData.filter((d) => new Date(d.date) >= cutoff)

    await habit.save()
    res.json(habit)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/habits/:id
const deleteHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!habit) {
      return res.status(404).json({ message: 'Hábito no encontrado' })
    }

    res.json({ message: 'Hábito eliminado' })
  } catch (error) {
    next(error)
  }
}

// POST /api/habits/reset-week — limpiar weekData de la semana actual
const resetWeek = async (req, res, next) => {
  try {
    const now = new Date()
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - dayOfWeek + 1)
    monday.setHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    sunday.setHours(23, 59, 59, 999)

    const habits = await Habit.find({ userId: req.user.id })

    for (const habit of habits) {
      habit.weekData = habit.weekData.filter((d) => {
        const dDate = new Date(d.date)
        return dDate < monday || dDate > sunday
      })
      await habit.save()
    }

    res.json({ message: 'Semana reseteada correctamente' })
  } catch (error) {
    next(error)
  }
}

module.exports = { getHabits, createHabit, toggleHabit, deleteHabit, resetWeek }
