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
    `SELECT DISTINCT teamId as id, name, COUNT(userId) as members
      FROM users_teams
    INNER JOIN teams
      ON teamId = id
    WHERE 
      teamId IN (SELECT DISTINCT teamId FROM users_teams WHERE '${req.user.id}' = userId)
    GROUP BY teamId, name`
  )

  res.status(200).json(teams)
})

// @desc    Get user team by ID
// @route   GET /api/teams/:id
// @access  Private
const getTeam = asyncHandler(async (req, res) => {
  // Get team ID and name, but only if the user making the request is a member of the team
  const [team] = await db.execute(
    `SELECT DISTINCT t.id, t.name
    FROM teams t
    LEFT JOIN users_teams u
    ON t.id = u.teamId
    WHERE t.id = '${req.params.id}' AND u.userId = '${req.user.id}'`
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
    `SELECT DISTINCT u.id, u.email, u.name, ut.role
      FROM users_teams ut
    INNER JOIN users u
      ON u.id = ut.userId
    WHERE ut.teamId = ${req.params.id}`
  )

  // Get all team's projects name, description, status and dueDate
  const [projects] = await db.execute(
    `SELECT DISTINCT p.id, p.name, p.description, p.status, p.dueDate
      FROM projects p
    INNER JOIN teams_projects tp
      ON p.id = tp.projectId
    INNER JOIN teams t
      ON t.id = tp.teamId
    WHERE t.id = ${req.params.id}`
  )

  // Return an object that contains both the team info, the users list and the projects list
  res.status(200).json({ team: team[0], users, projects })
})

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
const deleteTeam = asyncHandler(async (req, res) => {
  // Check if the user making the request is the team leader
  const [isLeader] = await db.execute(
    `SELECT role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${req.params.id} AND role = 'Team leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader can delete it.")
  }

  // Delete entries in projects, teams_projects and users_project using the teamId column in teams_projects table
  await db.execute(`DELETE tp, up, p
                    FROM teams_projects tp 
                    INNER JOIN projects p ON tp.projectId = p.id
                    INNER JOIN users_projects up ON tp.projectId = up.projectId
                    WHERE tp.teamId = ${req.params.id};
                  `)
  // Delete entries in users_teams
  await db.execute(
    `DELETE FROM users_teams ut WHERE ut.teamId = ${req.params.id};`
  )
  // Delete entries in teams
  await db.execute(`DELETE FROM teams t WHERE t.id = ${req.params.id};`)

  res.status(200).json("Team deleted successfully")
})

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
const updateTeam = asyncHandler(async (req, res) => {
  const { name } = req.body

  // Check if the user making the request is either the team leader or the co-leader
  const [isLeader] = await db.execute(
    `SELECT userId, role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${req.params.id} AND role = 'Team leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader can update the team.")
  }

  const updatedTeam = await db.execute(
    `UPDATE teams SET name = '${name}' WHERE id = ${req.params.id}`
  )

  res.status(200).json(updatedTeam)
})

// @desc    Add new member to team
// @route   POST /api/teams/:id/members
// @access  Private
const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body

  // Check if the user making the request is either the team leader or a co-leader
  const [isLeader] = await db.execute(
    `SELECT userId, role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${req.params.id} AND (role = 'Team leader' OR role = 'Co-leader')`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader and the co-leaders can add a member.")
  }

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
  const [isLeader] = await db.execute(
    `SELECT userId, role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${req.params.id} AND role = 'Team leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader can remove a member.")
  }

  // Get ID of the user to remove and check if it's the same as the team leader's ID
  const [user] = await db.execute(
    `SELECT id FROM users
    WHERE email = '${email}'`
  )

  if (user.length === 0) {
    res.status(401)
    throw new Error("Could not find a user with given email.")
  }

  if (isLeader[0].userId === user[0].id) {
    res.status(401)
    throw new Error("Can't remove the team leader.")
  }

  // Remove all the records from users_projects using teams_project to find the correct records to remove
  await db.execute(
    `DELETE up
      FROM users_projects up
      INNER JOIN teams_projects ut
      ON up.projectId = ut.projectId
      WHERE teamId = ${req.params.id} AND userId = ${user[0].id}`
  )

  // Remove record from users_teams
  const [removedMember] = await db.execute(
    `DELETE FROM users_teams WHERE userId = ${user[0].id} AND teamId = ${req.params.id}`
  )

  res.status(201).json(removedMember)
})

// @desc    Update member role
// @route   PUT /api/teams/:id/members
// @access  Private
const updateMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body

  // Check if the user making the request is either the team leader or the co-leader
  const [isLeader] = await db.execute(
    `SELECT userId, role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${req.params.id} AND (role = 'Team leader' OR role = 'Co-leader')`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error(
      "Only the team leader and the co-leaders can change the role of a member."
    )
  }

  // Get ID of the user to update and check if it's the same as the team leader's ID
  const [user] = await db.execute(
    `SELECT id FROM users
    WHERE email = '${email}'`
  )

  // Update member role
  if (role === "Team leader") {
    // If the role we want to set is "Team leader" AND the role of the user making the request is different from "Team leader", then throw an error
    if (isLeader[0].role !== "Team leader") {
      res.status(401)
      throw new Error("Only the team leader can set the new team leader.")
    } else {
      // First we set the current team leader's role to "Co-leader"
      await db.execute(
        `UPDATE users_teams SET role = 'Co-leader' WHERE role = 'Team leader' AND teamId = ${req.params.id}`
      )
      // Then we set the user whose role we want to change to "Team leader"
      await db.execute(
        `UPDATE users_teams SET role = 'Team leader' WHERE userId = ${user[0].id} AND teamId = ${req.params.id}`
      )
    }
  } else {
    // If the role we want to set is different from team leader, we change it ONLY IF the role of the member is not team leader, as changing it would leave the team without a leader
    await db.execute(
      `UPDATE users_teams SET role = '${role}' WHERE userId = ${user[0].id} AND teamId = ${req.params.id} AND (role != 'Team leader')`
    )
  }

  res.status(201).json("Role updated")
})

module.exports = {
  createTeam,
  getTeams,
  getTeam,
  deleteTeam,
  updateTeam,
  addMember,
  removeMember,
  updateMember,
}
