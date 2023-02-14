const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")
const db = require("../config/db")

const protect = asyncHandler(async (req, res, next) => {
  let token

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1]
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      // Get user from token
      const [userFetched] = await db.execute(
        `SELECT id, name, email, profileImage, createdAt, updatedAt FROM users WHERE id = '${decoded.id}'`
      )
      // Save user in request
      req.user = userFetched[0]

      next()
    } catch (error) {
      res.status(401)
      throw new Error("Not authorized")
    }
  }

  if (!token) {
    res.status(401)
    throw new Error("Not authorized")
  }
})

module.exports = { protect }
