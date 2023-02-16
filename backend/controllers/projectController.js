const asyncHandler = require("express-async-handler")
const db = require("../config/db")

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, dueDate, team } = req.body

  if (!name || !description || !dueDate || !team) {
    res.status(400)
    throw new Error("Please add a name, a description, a due date and a team")
  }

  // Check if the user making the request is the team leader
  const [isLeader] = await db.execute(
    `SELECT role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${team} AND role = 'Team leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader can create a project.")
  }

  // Create project
  const [project] = await db.execute(
    `INSERT INTO projects(name, description, status, dueDate) VALUES('${name}', '${description}', 'On track', '${dueDate}')`
  )

  // Create record in users_projects
  await db.execute(
    `INSERT INTO users_projects(userId, projectId, role) VALUES(${req.user.id}, ${project.insertId}, 'Project leader')`
  )

  // Create record in teams_projects
  await db.execute(
    `INSERT INTO teams_projects(teamId, projectId) VALUES(${team}, ${project.insertId})`
  )

  // Get newly created project
  const [newProject] = await db.execute(
    `SELECT * FROM projects WHERE id = ${project.insertId}`
  )

  res.status(201).json(newProject[0])
})

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const [projects] = await db.execute(
    `SELECT DISTINCT id, description, dueDate, name
      FROM projects
    INNER JOIN users_projects
      ON '${req.user.id}' = users_projects.userId`
  )

  res.status(200).json(projects)
})

// @desc    Get user project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  // Get project ID, name, description and dueDate but only if the user making the request is a member of the project
  const [project] = await db.execute(
    `SELECT DISTINCT p.id, p.name, p.dueDate, p.description
    FROM projects p
    LEFT JOIN users_projects u
    ON p.id = u.projectId
    WHERE p.id = ${req.params.id} AND u.userId = ${req.user.id}`
  )

  // If the project doesn't exist OR if the user making the request is not a member of the project
  if (project.length === 0) {
    res.status(404)
    throw new Error(
      "Couldn't find project. Either it doesn't exists or you don't have enough permissions to access it."
    )
  }

  // Get all project's members name and their role in the project
  const [users] = await db.execute(
    `SELECT DISTINCT u.name, up.role
      FROM users_projects up
    INNER JOIN users u
      ON u.id = up.userId`
  )

  // Return an object that contains both the project info and the users list
  res.status(200).json({ project: project[0], users })
})

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  // Check if the user making the request is the project leader
  const [isLeader] = await db.execute(
    `SELECT role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${req.params.id} AND role = 'Project leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the project leader can delete it.")
  }

  await db.execute(
    `DELETE FROM users_projects WHERE projectId = ${req.params.id};`
  )
  await db.execute(
    `DELETE FROM teams_projects WHERE projectId = ${req.params.id};`
  )
  await db.execute(`DELETE FROM projects WHERE id = ${req.params.id};`)

  res.status(200).json("Project deleted successfully")
})

// @desc    Update project
// @route   PUT /api/project/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const { name, status, dueDate, description } = req.body

  const [isLeader] = await db.execute(
    `SELECT role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${req.params.id} AND role = 'Project leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the project leader can update it.")
  }

  if (
    name !== undefined ||
    status !== undefined ||
    dueDate !== undefined ||
    description !== undefined
  ) {
    const updatedValues = {
      ...(name && { name: name }),
      ...(status && { status: status }),
      ...(dueDate && { dueDate: dueDate }),
      ...(description && { description: description }),
    }
    const whereClause = {
      id: req.params.id,
    }

    const [updatedProject] = await db.execute(
      db.format("UPDATE projects SET ? WHERE ?", [updatedValues, whereClause])
    )

    res.status(200).json(updatedProject)
  } else {
    res.status(200).json("There's nothing to change")
  }
})

module.exports = {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProject,
}
