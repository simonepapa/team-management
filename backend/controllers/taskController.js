const asyncHandler = require("express-async-handler")
const db = require("../config/db")

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const {
    name,
    assigneeEmail,
    priority,
    dueDate,
    project,
    isSubtask,
    mainTask,
  } = req.body

  if (
    name === undefined ||
    name === null ||
    assigneeEmail === undefined ||
    assigneeEmail === null ||
    priority === undefined ||
    priority === null ||
    dueDate === undefined ||
    dueDate === null ||
    project === undefined ||
    project === null ||
    isSubtask === undefined ||
    isSubtask === null
  ) {
    res.status(400)
    throw new Error(
      "Please add a name, an assignee, a priority, a project and a due date"
    )
  }

  const [user] = await db.execute(
    `SELECT id FROM users WHERE email = '${assigneeEmail}'`
  )

  if (user.length === 0) {
    res.status(401)
    throw new Error("Could not find a user with given email.")
  }

  const [isMember] = await db.execute(
    `SELECT * FROM users_projects WHERE userId = ${user[0].id} AND projectId = ${project}`
  )

  // If member is not in the project throw an error
  if (isMember.length === 0) {
    res.status(400)
    throw new Error("Member is not part of the project")
  }

  // Convert isSubtask to boolean
  const isSubtaskBool =
    isSubtask === true || isSubtask.toLowerCase() === "true" ? true : false

  const fields = {
    name: name,
    priority: priority,
    status: "Not completed",
    dueDate: dueDate,
    isSubtask: isSubtaskBool,
    ...(isSubtaskBool === true && {
      mainTask: mainTask,
    }),
  }

  // Create task
  const [task] = await db.execute(
    db.format("INSERT INTO tasks SET ?", [fields])
  )
  
  // Create record in users_tasks
  await db.execute(
    `INSERT INTO users_tasks(userId, taskId) VALUES (${user[0].id}, ${task.insertId})`
  )
  
  // Create record in projects_tasks
  await db.execute(
    `INSERT INTO projects_tasks(projectId, taskId) VALUES (${project}, ${task.insertId})`
  )

  // Get newly created task
  const [newTask] = await db.execute(
    `SELECT * FROM tasks WHERE id = ${task.insertId}`
  )

  res.status(201).json(newTask[0])
})

// @desc    Get user tasks, both main and sub
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  const [tasks] = await db.execute(
    `SELECT DISTINCT t.id, t.name, t.priority, t.status, t.dueDate, t.isSubtask, t.mainTask, t.createdAt, t.updatedAt, t.completedAt
      FROM tasks t
    INNER JOIN users_tasks ut
      ON t.id = ut.taskId
    WHERE '${req.user.id}' = ut.userId
    ORDER BY dueDate`
  )

  res.status(200).json(tasks)
})

// @desc    Get completed tasks
// @route   GET /api/tasks/completed
// @access  Private
const getCompleted = asyncHandler(async (req, res) => {
  const { completedPage } = req.query
  const offset = (completedPage === "1" || completedPage === "0" || completedPage === undefined) ? 0 : (completedPage - 1) * 10

  const [tasks] = await db.execute(`
    SELECT DISTINCT t.id, t.name, t.priority, t.status, t.dueDate, t.isSubtask, t.mainTask, t.createdAt, t.updatedAt, t.completedAt
    FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.status = "Completed" AND t.isSubtask = false
    ORDER BY t.dueDate
    LIMIT 10
    OFFSET ${offset};
  `)

  const [total] = await db.execute(`
    SELECT COUNT(*) FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.status = "Completed" AND t.isSubtask = false;
  `)

  res.status(200).json({ total: total[0]["COUNT(*)"], tasks: tasks })
})

// @desc    Get completed tasks
// @route   GET /api/tasks/uncompleted
// @access  Private
const getUncompleted = asyncHandler(async (req, res) => {
  const { uncompletedPage } = req.query
  const offset = (uncompletedPage === "1" || uncompletedPage === "0" || uncompletedPage === undefined) ? 0 : (uncompletedPage - 1) * 10

  const [tasks] = await db.execute(`
    SELECT DISTINCT t.id, t.name, t.priority, t.status, t.dueDate, t.isSubtask, t.mainTask, t.createdAt, t.updatedAt, t.completedAt
    FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.status = "Not completed" AND t.isSubtask = false
    ORDER BY t.dueDate
    LIMIT 10
    OFFSET ${offset};
  `)

  const [total] = await db.execute(`
    SELECT COUNT(*) FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.status = "Not completed" AND t.isSubtask = false;
  `)

  res.status(200).json({ total: total[0]["COUNT(*)"], tasks: tasks })
})

// @desc    Get user main tasks
// @route   GET /api/tasks/main
// @access  Private
const getMain = asyncHandler(async (req, res) => {
  const { page } = req.query
  const offset = (page === "1" || page === "0" || page === undefined) ? 0 : (page - 1) * 10

  const [tasks] = await db.execute(`
    SELECT DISTINCT t.id, t.name, t.priority, t.status, t.dueDate, t.isSubtask, t.mainTask, t.createdAt, t.updatedAt, t.completedAt
    FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.isSubtask = false
    ORDER BY t.dueDate
    LIMIT 10
    OFFSET ${offset};
  `)

  const [total] = await db.execute(`
    SELECT COUNT(*) FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.isSubtask = false;
  `)

  res.status(200).json({ total: total[0]["COUNT(*)"], tasks: tasks })
})

// @desc    Get user sub tasks
// @route   GET /api/tasks/sub
// @access  Private
const getSub = asyncHandler(async (req, res) => {
  const [tasks] = await db.execute(`
    SELECT DISTINCT t.id, t.name, t.priority, t.status, t.dueDate, t.isSubtask, t.mainTask, t.createdAt, t.updatedAt, t.completedAt
    FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.isSubtask = true
    ORDER BY t.dueDate;
  `)

  res.status(200).json(tasks)
})

// @desc    Get a task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = asyncHandler(async (req, res) => {
  const [task] = await db.execute(
    `SELECT * 
    FROM tasks t
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    INNER JOIN projects_tasks pt
    ON t.id = pt.taskId
    WHERE t.id = ${req.params.id} AND ut.userId = ${req.user.id}`
  )

  // If the task doesn't exist OR if the user making the request is not the assignee
  if (task.length === 0) {
    res.status(404)
    throw new Error(
      "Couldn't find given task. Either it doesn't exists or you don't have enough permissions to access it."
    )
  }

  res.status(200).json(task)
})

module.exports = {
  createTask,
  getTasks,
  getCompleted,
  getUncompleted,
  getMain,
  getSub,
  getTask,
}
