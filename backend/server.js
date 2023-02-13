const express = require("express")
const dotenv = require("dotenv").config()
const { errorHandler } = require("./middleware/errorMiddleware")
const connectDB = require("./config/db")
const PORT = process.env.PORT || 5000

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the team management API" })
})

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});

// Routes
app.use("/api/users", require("./routes/userRoutes"))
//app.use("/api/teams", require("./routes/teamRoutes"))
//app.use("/api/projects", require("./routes/projectRoutes"))
//app.use("/api/tasks", require("./routes/taskRoutes"))

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
