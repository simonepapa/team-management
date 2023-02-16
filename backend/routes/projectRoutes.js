const express = require("express")
const router = express.Router()
const {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProject,
  //getMembers,
  //addMember,
  //removeMember,
  //updateMember,
  //getMemberTasks,
  //getProjectTasks,
} = require("../controllers/projectController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createProject).get(protect, getProjects)
router.route("/:id").get(protect, getProject).delete(protect, deleteProject).put(protect, updateProject)

module.exports = router
