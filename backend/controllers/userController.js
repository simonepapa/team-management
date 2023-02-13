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
  console.log(user)

  res.status(201).json({
    id: user.insertId,
    name: name,
    email: email,
    token: generateToken(user.id),
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
      token: generateToken(user.id),
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

module.exports = {
  registerUser,
  loginUser,
}
