const express = require("express")
const router = express.Router()
const {
  registerUser,
  loginUser,
  getUserTeamsLeader
} = require("../controllers/userController")

const { protect } = require("../middleware/authMiddleware")

router.post("/", registerUser)
router.post("/login", loginUser)
router.get("/teams", protect, getUserTeamsLeader)

module.exports = router 