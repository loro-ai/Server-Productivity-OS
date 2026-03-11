const Routine = require('../models/Routine')
const RoutineLog = require('../models/RoutineLog')

// GET /api/routine/:type — obtener rutina (crea una vacía si no existe)
const getRoutine = async (req, res, next) => {
  try {
    const { type } = req.params

    if (!['morning', 'night'].includes(type)) {
      return res.status(400).json({ message: "El tipo debe ser 'morning' o 'night'" })
    }

    let routine = await Routine.findOne({ userId: req.user.id, type })

    // Si no existe, crear rutina vacía con ítems por defecto
    if (!routine) {
      const defaultItems = type === 'morning'
        ? [
            { text: 'Hidratarse con un vaso de agua', order: 0 },
            { text: 'Revisar agenda del día', order: 1 },
            { text: 'Ejercicio o stretching 10 min', order: 2 },
          ]
        : [
            { text: 'Revisar tareas completadas', order: 0 },
            { text: 'Preparar agenda del mañana', order: 1 },
            { text: 'Lectura 20 minutos', order: 2 },
          ]

      routine = await Routine.create({
        userId: req.user.id,
        type,
        items: defaultItems,
      })
    }

    res.json(routine)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/routine/:type/items — actualizar lista de ítems
const updateRoutineItems = async (req, res, next) => {
  try {
    const { type } = req.params
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Los ítems deben ser un array' })
    }

    const routine = await Routine.findOneAndUpdate(
      { userId: req.user.id, type },
      { items },
      { new: true, upsert: true }
    )

    res.json(routine)
  } catch (error) {
    next(error)
  }
}

// POST /api/routine/:type/log — guardar log del día
const logRoutine = async (req, res, next) => {
  try {
    const { type } = req.params
    const { completedItems } = req.body

    const routine = await Routine.findOne({ userId: req.user.id, type })
    if (!routine) {
      return res.status(404).json({ message: 'Rutina no encontrada' })
    }

    // Fecha actual en formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    // Upsert: actualizar o crear log del día
    const log = await RoutineLog.findOneAndUpdate(
      { userId: req.user.id, routineId: routine._id, date: today },
      { completedItems: completedItems || [] },
      { new: true, upsert: true }
    )

    res.json(log)
  } catch (error) {
    next(error)
  }
}

// GET /api/routine/:type/log/today — obtener log de hoy
const getTodayLog = async (req, res, next) => {
  try {
    const { type } = req.params

    const routine = await Routine.findOne({ userId: req.user.id, type })
    if (!routine) {
      return res.json({ completedItems: [] })
    }

    const today = new Date().toISOString().split('T')[0]
    const log = await RoutineLog.findOne({
      userId: req.user.id,
      routineId: routine._id,
      date: today,
    })

    res.json(log || { completedItems: [] })
  } catch (error) {
    next(error)
  }
}

module.exports = { getRoutine, updateRoutineItems, logRoutine, getTodayLog }
