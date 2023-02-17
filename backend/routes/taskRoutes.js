const express = require("express")
const router = express.Router()
const {
  createTask,
  getTasks,
  getCompleted,
  getUncompleted,
  getTask,
  //getMain,
  //getSub,
  //updateTask,
  //deleteTask,
  //completeTask,
  //getTaskSubtasks
} = require("../controllers/taskController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createTask).get(protect, getTasks)
router.route("/completed").get(protect, getCompleted)
router.route("/uncompleted").get(protect, getUncompleted)
router.route("/:id").get(protect, getTask)

module.exports = router
