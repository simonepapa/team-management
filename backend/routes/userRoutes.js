const express = require("express")
const router = express.Router()
const {
  registerUser,
  loginUser,
  getUserTeamsLeader,
  getUserProjects
} = require("../controllers/userController")

const { protect } = require("../middleware/authMiddleware")

router.post("/", registerUser)
router.post("/login", loginUser)
router.get("/teams", protect, getUserTeamsLeader)
router.get("/:id/projects", protect, getUserProjects)

module.exports = router 