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
  const offset =
    completedPage === "1" ||
    completedPage === "0" ||
    completedPage === undefined
      ? 0
      : (completedPage - 1) * 10

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
  const [tasks] = await db.execute(`
    SELECT DISTINCT t.id, t.name, t.priority, t.status, t.dueDate, t.isSubtask, t.mainTask, t.createdAt, t.updatedAt, t.completedAt, p.name as project
      FROM tasks t 
    INNER JOIN users_tasks ut
      ON t.id = ut.taskId
    INNER JOIN projects_tasks pt
      ON t.id = pt.taskId
    INNER JOIN projects p
      ON pt.projectId = p.id
    WHERE ut.userId = ${req.user.id} AND t.status = "Not completed" AND t.isSubtask = false
    ORDER BY t.dueDate;
  `)

  res.status(200).json(tasks)
})

// @desc    Get user main tasks
// @route   GET /api/tasks/main
// @access  Private
const getMain = asyncHandler(async (req, res) => {
  const { page } = req.query
  const offset =
    page === "1" || page === "0" || page === undefined ? 0 : (page - 1) * 10

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

// @desc    Get task subtasks
// @route   GET /api/tasks/:id/sub
// @access  Private
const getTaskSubtasks = asyncHandler(async (req, res) => {
  const [tasks] = await db.execute(
    `SELECT DISTINCT t.id, t.name, t.priority, t.status, t.dueDate, t.isSubtask, t.mainTask, t.createdAt, t.updatedAt, t.completedAt
    FROM tasks t 
    INNER JOIN users_tasks ut
    ON t.id = ut.taskId
    WHERE ut.userId = ${req.user.id} AND t.isSubtask = true AND t.mainTask = ${req.params.id}
    ORDER BY t.dueDate;`
  )

  res.status(200).json(tasks)
})

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const { dueDate, priority, assigneeEmail } = req.body

  // If the assigneeEmail is different from an empty string and is not a valid email
  // The empty string check is due to the fact that if the string is empty, then the assignee is the user making the request
  if (assigneeEmail !== "" && !validateEmail(assigneeEmail)) {
    res.status(400)
    throw new Error("Bad email format")
  }

  // If assigneeEmail is not empty put the email in WHERE clause, else put the ID of the user making the request
  const fields = {
    ...(assigneeEmail !== "" ? { email: assigneeEmail } : { id: req.user.id }),
  }

  // Check if the user exists
  const [user] = await db.execute(
    db.format("SELECT id FROM users WHERE ?", [fields])
  )

  if (user.length === 0) {
    res.status(401)
    throw new Error("Could not find a user with given email.")
  }

  // Check if the user is the task assignee
  const [isAssignee] = await db.execute(
    `SELECT userId FROM users_tasks WHERE taskId = ${req.params.id} AND userId = ${user[0].id}`
  )

  if (isAssignee.length === 0) {
    res.status(401)
    throw new Error("Only the task assignee can update it")
  }

  // If there's something to change
  if (dueDate !== undefined || priority !== undefined) {
    const updatedValues = {
      ...(dueDate && { dueDate: dueDate }),
      ...(priority && { priority: priority }),
    }
    const whereClause = {
      id: req.params.id,
    }

    const [updatedTask] = await db.execute(
      db.format("UPDATE tasks SET ? WHERE ?", [updatedValues, whereClause])
    )

    res.status(201).json(updatedTask)
  } else {
    res.status(200).json("There's nothing to change")
  }
})

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  // Retrieve the project ID
  const [project] = await db.execute(
    `SELECT projectId FROM projects_tasks WHERE taskId = ${req.params.id}`
  )

  if (project.length === 0) {
    res.status(400)
    throw new Error("The task does not exists.")
  }

  // Retrieve the project role of the user making the request
  const [userRole] = await db.execute(
    `SELECT role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${project[0].projectId}`
  )

  if (userRole.length === 0) {
    res.status(401)
    throw new Error("User is not part of the project.")
  }

  // If the user is not the project leader, then we check that he is the task assignee. The project leader can delete the tasks of every member of the project
  if (userRole[0].role !== "Project leader") {
    // Check if the user is the task assignee
    const [isAssignee] = await db.execute(
      `SELECT userId FROM users_tasks WHERE taskId = ${req.params.id} AND userId = ${req.user.id}`
    )

    if (isAssignee.length === 0) {
      res.status(401)
      throw new Error("Only the task assignee can delete it.")
    }
  }

  // First we delete the records from tables with a foreign key, then we delete the task
  await db.execute(
    `DELETE FROM projects_tasks WHERE taskId = ${req.params.id};`
  )
  await db.execute(`DELETE FROM users_tasks WHERE taskId = ${req.params.id};`)
  await db.execute(`DELETE FROM tasks WHERE id = ${req.params.id};`)

  res.status(201).json("Task deleted successfully")
})

// @desc    Complete/uncomplete task
// @route   PUT /api/tasks/:id/status
// @access  Private
const completeTask = asyncHandler(async (req, res) => {
  const { status } = req.body
  if (!(status === "Completed" || status === "Not completed")) {
    res.status(400)
    throw new Error("Status value is not valid")
  }

  const [isAssignee] = await db.execute(
    `SELECT userId FROM users_tasks WHERE taskId = ${req.params.id} AND userId = ${req.user.id}`
  )

  if (isAssignee.length === 0) {
    res.status(401)
    throw new Error("Only the task assignee can change its status")
  }

  const updatedValues = {
    status: status,
    ...(status === "Completed"
      ? { completedAt: new Date() }
      : { completedAt: null }),
  }
  const whereClause = {
    id: req.params.id,
  }

  const [updatedTask] = await db.execute(
    db.format("UPDATE tasks SET ? WHERE ?", [updatedValues, whereClause])
  )

  res.status(201).json(updatedTask)
})

const validateEmail = function (email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  return re.test(email)
}

module.exports = {
  createTask,
  getTasks,
  getCompleted,
  getUncompleted,
  getMain,
  getSub,
  getTask,
  getTaskSubtasks,
  updateTask,
  deleteTask,
  completeTask,
}
