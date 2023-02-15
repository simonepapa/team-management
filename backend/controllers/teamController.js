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
  const [team] = await db.execute(`INSERT INTO teams(name) VALUES('${name}')`)

  // Create record in users_teams
  await db.execute(
    `INSERT INTO users_teams(userId, teamId, role) VALUES(${req.user.id}, ${team.insertId}, 'Team leader')`
  )

  // Get newly created team
  const [newTeam] = await db.execute(
    `SELECT * FROM teams WHERE id = ${team.insertId}`
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
  // Get team ID and name, but only if the user making the request is a member of the team
  const [team] = await db.execute(
    `SELECT DISTINCT t.id, t.name
    FROM teams t
    LEFT JOIN users_teams u
    ON t.id = u.teamId
    WHERE t.id = ${req.params.id} AND u.userId = ${req.user.id}`
  )

  // If the team doesn't exist OR if the user making the request is not a member of the team
  if (team.length === 0) {
    res.status(404)
    throw new Error(
      "Couldn't find team. Either it doesn't exists or you don't have enough permissions to access it."
    )
  }

  // Get all team's members name and their role in the team
  const [users] = await db.execute(
    `SELECT DISTINCT u.name, ut.role
      FROM users_teams ut
    INNER JOIN users u
      ON u.id = ut.userId`
  )

  // Return an object that contains both the team info and the users list
  res.status(200).json({ team: team[0], users })
})

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
const deleteTeam = asyncHandler(async (req, res) => {
  // Check if the user making the request is the team leader
  const [teamLeader] = await db.execute(
    `SELECT role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${req.params.id} AND role = 'Team leader'`
  )

  if (teamLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader can delete the team.")
  }

  await db.execute(`DELETE FROM users_teams WHERE teamId = ${req.params.id};`)
  await db.execute(`DELETE FROM teams WHERE id = ${req.params.id};`)

  // TO DO - Remove all the records with teamId of req.params.id from teams_projects

  res.status(200).json("Team deleted successfully")
})

// @desc    Add new member to team
// @route   POST /api/teams/:id/members
// @access  Private
const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body

  const [user] = await db.execute(
    `SELECT id FROM users
    WHERE email = '${email}'`
  )

  // Create record in users_teams
  const [userTeam] = await db.execute(
    `INSERT INTO users_teams(userId, teamId, role) VALUES(${user[0].id}, ${req.params.id}, 'Collaborator')`
  )

  res.status(201).json(userTeam)
})

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
  const { email } = req.body

  // Check if the user making the request is the team leader
  const [teamLeader] = await db.execute(
    `SELECT userId, role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${req.params.id} AND role = 'Team leader'`
  )

  if (teamLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader can delete the team.")
  }

  // Get ID of the user to remove and check if it's the same as the team leader's ID
  const [user] = await db.execute(
    `SELECT id FROM users
    WHERE email = '${email}'`
  )

  if (teamLeader[0].userId === user[0].id) {
    res.status(401)
    throw new Error("Can't remove the team leader.")
  }
  
  // Remove record from users_teams
  const [removedMember] = await db.execute(
    `DELETE FROM users_teams WHERE userId = ${user[0].id} AND teamId = ${req.params.id}`
  )

  res.status(201).json(removedMember)
})

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  deleteTeam,
  addMember,
  removeMember,
}
