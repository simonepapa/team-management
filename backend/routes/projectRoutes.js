const express = require("express")
const router = express.Router()
const {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProject,
  addMember,
  removeMember,
  updateMember,
} = require("../controllers/projectController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createProject).get(protect, getProjects)
router.route("/:id").get(protect, getProject).delete(protect, deleteProject).put(protect, updateProject)
router.route("/:id/members").post(protect, addMember).delete(protect, removeMember).put(protect, updateMember)

module.exports = router
