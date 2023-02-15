const express = require("express")
const router = express.Router()
const {
  createTeam,
  getTeams,
  getTeam,
  deleteTeam,
  updateTeam,
  //getMembers,
  addMember,
  updateMember,
  removeMember,
} = require("../controllers/teamController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createTeam).get(protect, getTeams)
router.route("/:id").get(protect, getTeam).delete(protect, deleteTeam).put(protect, updateTeam)
router.route("/:id/members").post(protect, addMember).delete(protect, removeMember).put(protect, updateMember)

module.exports = router
