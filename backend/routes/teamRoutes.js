const express = require("express")
const router = express.Router()
const {
  createTeam,
  getTeams,
  getTeam,
  //getMembers,
  addMember,
  //updateMember,
  removeMember,
  deleteTeam,
  //updateTeam,
} = require("../controllers/teamController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createTeam).get(protect, getTeams)
router.route("/:id").get(protect, getTeam).delete(protect, deleteTeam)
router.route("/:id/members").post(protect, addMember).delete(protect, removeMember)

module.exports = router
