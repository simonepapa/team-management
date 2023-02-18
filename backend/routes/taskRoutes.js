const express = require("express")
const router = express.Router()
const {
  createTask,
  getTasks,
  getCompleted,
  getUncompleted,
  getMain,
  getSub,
  getTask,
  updateTask,
  deleteTask,
  getTaskSubtasks,
  completeTask,
} = require("../controllers/taskController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createTask).get(protect, getTasks)
router.route("/completed").get(protect, getCompleted)
router.route("/uncompleted").get(protect, getUncompleted)
router.route("/main").get(protect, getMain)
router.route("/sub").get(protect, getSub)
router.route("/:id").get(protect, getTask).put(protect, updateTask).delete(protect, deleteTask)
router.route("/:id/sub").get(protect, getTaskSubtasks)
router.route("/:id/status").put(protect, completeTask)

module.exports = router
