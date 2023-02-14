const asyncHandler = require("express-async-handler")
const db = require("../config/db")

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
const createTeam = asyncHandler(async (req, res) => {
  const { name } = req.body

  if (!name) {
    res.status(400)
    throw new Error("Please add a name")
  }

  // Create team
  const [team] = await db.execute(
    `INSERT INTO teams(name) VALUES('${name}')`
  )

  // Create record in users_teams
  const [userTeam] = await db.execute(
    `INSERT INTO users_teams(userId, teamId, role) VALUES('${req.user.id}', '${team.insertId}', 'Team leader')`
  )

  // Get newly created team
  const [newTeam] = await db.execute(
    `SELECT * FROM teams WHERE id = '${team.insertId}'`
  )

  res.status(201).json(newTeam[0])
})

// @desc    Get user teams
// @route   GET /api/teams
// @access  Private
const getTeams = asyncHandler(async (req, res) => {
  const [teams] = await db.execute(
    `SELECT DISTINCT id, name
      FROM teams
    INNER JOIN users_teams
      ON '${req.user.id}' = users_teams.userId`
  )

  res.status(200).json(teams)
})

// @desc    Get user team
// @route   GET /api/teams/:id
// @access  Private
const getTeam = asyncHandler(async (req, res) => {
  const [team] = await db.execute(
    `SELECT DISTINCT t.id, t.name
    FROM teams t
    LEFT JOIN users_teams u
    ON t.id = u.teamId
    WHERE t.id = '${req.params.id}' AND u.userId = '${req.user.id}'`
  )

  if (team.length === 0) {
    res.status(404)
    throw new Error("Couldn't find team. Either it doesn't exists or you don't have enough permissions to access it.")
  }

  res.status(200).json(team)
})

module.exports = {
  createTeam,
  getTeams,
  getTeam,
}
