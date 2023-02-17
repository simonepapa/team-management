const express = require("express")
const router = express.Router()
const {
  createTask,
  getTasks,
  getTask
  //getCompleted,
  //getUncompleted,
  //getMain,
  //getSub,
  //updateTask,
  //deleteTask,
  //completeTask,
  //getTaskSubtasks
} = require("../controllers/taskController.js")

const { protect } = require("../middleware/authMiddleware")

router.route("/").post(protect, createTask).get(protect, getTasks)
router.route("/:id").get(protect, getTask)

module.exports = router
