const asyncHandler = require("express-async-handler")
const db = require("../config/db")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// @desc    Register a new user
// @route   /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Validation
  if (!name || !email || !password) {
    res.status(400)
    throw new Error("Please include all fields")
  }

  // Find if user already exists
  const [userExists] = await db.execute(
    `SELECT * FROM users WHERE email = '${email}'`
  )

  if (userExists.length !== 0) {
    res.status(400)
    throw new Error("User already exists")
  }

  // Hash password (these functions return Promises, that's why we're using await)
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Create user
  const [user] = await db.execute(
    `INSERT INTO users(name, email, password) VALUES('${name}', '${email}', '${hashedPassword}')`
  )

  res.status(201).json({
    id: user.insertId,
    name: name,
    email: email,
    token: generateToken(user.insertId),
  })
})

// @desc    Login a new user
// @route   /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  
  const [user] = await db.execute(
    `SELECT * FROM users WHERE email = '${email}'`
  )

  // Check if credentials are correct
  if (user.length === 0) {
    res.status(400)
    throw new Error("Invalid credentials")
  }
  
  // Check user and passwords match
  if (await bcrypt.compare(password, user[0].password)) {
    res.status(200).json({
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      token: generateToken(user[0].id),
    })
  } else {
    res.status(401)
    throw new Error("Invalid credentials")
  }
})

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Get teams where the user is leader
// @route   /api/users/teams
// @access  Private
const getUserTeamsLeader = asyncHandler(async (req, res) => {
  const [teams] = await db.execute(
    `SELECT DISTINCT ut.teamId as id, t.name
      FROM users_teams ut
    INNER JOIN teams t
      ON ut.teamId = t.id
    WHERE userId = ${req.user.id} AND role = 'Team leader'`
  )

  res.status(200).json(teams)
})

// @desc    Get user's projects
// @route   /api/users/:id/projects
// @access  Private
const getUserProjects = asyncHandler(async (req, res) => {
  const [projects] = await db.execute(
    `SELECT DISTINCT p.name, p.status, p.dueDate
      FROM projects p
    INNER JOIN users_projects up
      ON p.id = up.projectId
    WHERE up.userId = ${req.params.id}`
  )

  res.status(200).json(projects)
})

module.exports = {
  registerUser,
  loginUser,
  getUserTeamsLeader,
  getUserProjects
}
