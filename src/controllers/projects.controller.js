const Project = require('../models/Project')

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ userId: req.user.id }).sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    next(error)
  }
}

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, area, status, dueDate } = req.body

    if (!name || !area) {
      return res.status(400).json({ message: 'Nombre y área son requeridos' })
    }

    const project = await Project.create({
      userId: req.user.id,
      name,
      area,
      status: status || 'activo',
      dueDate: dueDate || null,
    })

    res.status(201).json(project)
  } catch (error) {
    next(error)
  }
}

// PATCH /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    // Whitelist: solo campos que el cliente puede modificar
    const { name, area, status, dueDate } = req.body
    const allowedUpdate = {}

    if (name !== undefined) allowedUpdate.name = name
    if (area !== undefined) allowedUpdate.area = area
    if (status !== undefined) allowedUpdate.status = status
    if (dueDate !== undefined) allowedUpdate.dueDate = dueDate

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      allowedUpdate,
      { new: true, runValidators: true }
    )

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' })
    }

    res.json(project)
  } catch (error) {
    next(error)
  }
}

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' })
    }

    res.json({ message: 'Proyecto eliminado' })
  } catch (error) {
    next(error)
  }
}

// PATCH /api/projects/:id/progress — actualizar porcentaje de progreso
const updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'El progreso debe ser entre 0 y 100' })
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { progress },
      { new: true }
    )

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' })
    }

    res.json(project)
  } catch (error) {
    next(error)
  }
}

module.exports = { getProjects, createProject, updateProject, deleteProject, updateProgress }
