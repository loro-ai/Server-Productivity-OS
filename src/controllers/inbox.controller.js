const Inbox = require('../models/Inbox')
const Task = require('../models/Task')
const Project = require('../models/Project')

// V-13: sanitización de texto plano — elimina cualquier HTML/script
// sin dependencias externas, suficiente para evitar XSS almacenado
const sanitizeText = (text) => {
  if (typeof text !== 'string') return ''
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

// GET /api/inbox — con filtro opcional por processed
const getInbox = async (req, res, next) => {
  try {
    const filter = { userId: req.user.id }

    if (req.query.processed !== undefined) {
      filter.processed = req.query.processed === 'true'
    }

    const items = await Inbox.find(filter).sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    next(error)
  }
}

// POST /api/inbox — captura rápida (también usada por n8n y VAPI)
const createInboxItem = async (req, res, next) => {
  try {
    const raw = req.body.text

    if (!raw) {
      return res.status(400).json({ message: 'El texto es requerido' })
    }

    // V-13: sanitizar antes de guardar
    const text = sanitizeText(raw)

    if (!text) {
      return res.status(400).json({ message: 'El texto no puede estar vacío' })
    }

    const item = await Inbox.create({ userId: req.user.id, text })
    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/inbox/:id/convert — convertir a tarea o proyecto
const convertInboxItem = async (req, res, next) => {
  try {
    const { to } = req.body

    if (!['task', 'project'].includes(to)) {
      return res.status(400).json({ message: "El destino debe ser 'task' o 'project'" })
    }

    const item = await Inbox.findOne({ _id: req.params.id, userId: req.user.id })

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' })
    }

    let created
    if (to === 'task') {
      created = await Task.create({
        userId: req.user.id,
        title: item.text,  // ya sanitizado al guardar
        priority: 'media',
      })
    } else {
      created = await Project.create({
        userId: req.user.id,
        name: item.text,   // ya sanitizado al guardar
        area: 'General',
        status: 'planificado',
      })
    }

    item.processed = true
    item.convertedTo = to
    await item.save()

    res.json({ item, created })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/inbox/:id
const deleteInboxItem = async (req, res, next) => {
  try {
    const item = await Inbox.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' })
    }

    res.json({ message: 'Item eliminado' })
  } catch (error) {
    next(error)
  }
}

module.exports = { getInbox, createInboxItem, convertInboxItem, deleteInboxItem }
