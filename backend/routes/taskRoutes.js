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
  //updateTask,
  //deleteTask,
  //completeTask,
  getTaskSubtasks
} = require("../controllers/taskController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createTask).get(protect, getTasks)
router.route("/completed").get(protect, getCompleted)
router.route("/uncompleted").get(protect, getUncompleted)
router.route("/main").get(protect, getMain)
router.route("/sub").get(protect, getSub)
router.route("/:id").get(protect, getTask)
router.route("/:id/sub").get(protect, getTaskSubtasks)

module.exports = router
