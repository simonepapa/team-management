const express = require("express")
const router = express.Router()
const {
  createTeam,
  getTeams,
  getTeam,
  deleteTeam,
  updateTeam,
  addMember,
  updateMember,
  removeMember,
  getLeader
} = require("../controllers/teamController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createTeam).get(protect, getTeams)
router.route("/:id").get(protect, getTeam).delete(protect, deleteTeam).put(protect, updateTeam)
router.route("/:id/members").post(protect, addMember).delete(protect, removeMember).put(protect, updateMember)
router.route("/:id/leader").get(protect, getLeader)

module.exports = router
