const asyncHandler = require("express-async-handler")
const db = require("../config/db")

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const { name, description, dueDate, team } = req.body

  if (!name || !description || !dueDate || !team) {
    res.status(400)
    throw new Error("Please add a name, a description, a due date and a team")
  }

  const date = new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ');

  // Check if the user making the request is the team leader
  const [isLeader] = await db.execute(
    `SELECT role FROM users_teams WHERE userId = ${req.user.id} AND teamId = ${team} AND role = 'Team leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the team leader can create a project.")
  }

  // Create project
  const [project] = await db.execute(
    `INSERT INTO projects(name, description, status, dueDate) VALUES('${name}', '${description}', 'On track', '${date}')`
  )

  // Create record in users_projects
  await db.execute(
    `INSERT INTO users_projects(userId, projectId, role) VALUES(${req.user.id}, ${project.insertId}, 'Project leader')`
  )

  // Create record in teams_projects
  await db.execute(
    `INSERT INTO teams_projects(teamId, projectId) VALUES(${team}, ${project.insertId})`
  )

  // Get newly created project
  const [newProject] = await db.execute(
    `SELECT * FROM projects WHERE id = ${project.insertId}`
  )

  res.status(201).json(newProject[0])
})

// @desc    Get user projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const [projects] = await db.execute(
    `SELECT DISTINCT projectId as id, name, status, description, dueDate, COUNT(userId) as members
      FROM users_projects
    INNER JOIN projects
      ON projectId = id
    WHERE 
      projectId IN (SELECT DISTINCT projectId FROM users_projects WHERE '${req.user.id}' = userId)
    GROUP BY projectId, name, status, description, dueDate`
  )

  res.status(200).json(projects)
})

// @desc    Get user project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  // Get project ID, name, description and dueDate but only if the user making the request is a member of the project
  const [project] = await db.execute(
    `SELECT DISTINCT p.id, p.name, p.dueDate, p.description, p.status
      FROM projects p
    LEFT JOIN users_projects u
      ON p.id = u.projectId
    WHERE p.id = ${req.params.id} AND u.userId = ${req.user.id}`
  )

  // If the project doesn't exist OR if the user making the request is not a member of the project
  if (project.length === 0) {
    res.status(404)
    throw new Error(
      "Couldn't find given project. Either it doesn't exists or you don't have enough permissions to access it."
    )
  }

  // Get project's team name
  const [team] = await db.execute(
    `SELECT DISTINCT t.name
      FROM teams t
    INNER JOIN teams_projects tp
      ON t.id = tp.teamId
    WHERE tp.projectId = ${req.params.id}`
  )

  // Get all project's members name and their role in the project
  const [users] = await db.execute(
    `SELECT DISTINCT u.id, u.email, u.name, up.role
      FROM users_projects up
    INNER JOIN users u
      ON u.id = up.userId
    WHERE up.projectId = ${req.params.id}
    ORDER BY FIELD(role,'Project leader','Co-leader','Collaborator')`
  )

  // Get project leader
  const [leader] = await db.execute(
    `SELECT DISTINCT userId FROM users_projects WHERE role = 'Project leader' AND projectId = ${req.params.id}`
  )

  // Return an object that contains both the project info, team name and the users list
  res.status(200).json({ project: project[0], team, users, leader })
})

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  // Check if the user making the request is the project leader
  const [isLeader] = await db.execute(
    `SELECT role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${req.params.id} AND role = 'Project leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the project leader can delete it.")
  }

  await db.execute(
    `DELETE FROM users_projects WHERE projectId = ${req.params.id};`
  )
  await db.execute(
    `DELETE FROM teams_projects WHERE projectId = ${req.params.id};`
  )
  await db.execute(`DELETE FROM projects WHERE id = ${req.params.id};`)

  res.status(200).json("Project deleted successfully")
})

// @desc    Update project
// @route   PUT /api/project/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const { name, status, dueDate, description } = req.body

  const [isLeader] = await db.execute(
    `SELECT role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${req.params.id} AND role = 'Project leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the project leader can update it.")
  }

  if (
    name !== undefined ||
    status !== undefined ||
    dueDate !== undefined ||
    description !== undefined
  ) {
    const updatedValues = {
      ...(name && { name: name }),
      ...(status && { status: status }),
      ...(dueDate && { dueDate: dueDate }),
      ...(description && { description: description }),
    }
    const whereClause = {
      id: req.params.id,
    }

    const [updatedProject] = await db.execute(
      db.format("UPDATE projects SET ? WHERE ?", [updatedValues, whereClause])
    )

    res.status(200).json(updatedProject)
  } else {
    res.status(200).json("There's nothing to change")
  }
})

// @desc    Add new member to project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body

  // Check if the user making the request is the team leader
  const [isLeader] = await db.execute(
    `SELECT userId, role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${req.params.id} AND (role = 'Project leader' OR role = 'Co-leader')`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error(
      "Only the project leader and the co-leaders can add a member."
    )
  }

  const [user] = await db.execute(
    `SELECT id FROM users
    WHERE email = '${email}'`
  )

  const [team] = await db.execute(
    `SELECT teamId FROM teams_projects WHERE projectId = ${req.params.id}`
  )

  // If team exists
  if (team.length !== 0) {
    // Check if the user we're trying to add is a member of the project's team
    const [isTeamMember] = await db.execute(
      `SELECT userId FROM users_teams WHERE userId = ${user[0].id} AND teamId = ${team[0].teamId}`
    )

    if (isTeamMember.length === 0) {
      res.status(400)
      throw new Error("Member is not part of the project's team")
    }

    // If successful, create record in users_projects
    const [userProject] = await db.execute(
      `INSERT INTO users_projects(userId, projectId, role) VALUES(${user[0].id}, ${req.params.id}, 'Collaborator')`
    )

    res.status(201).json(userProject)
  }

  res.status(400).json("Could not add the member to the project.")
})

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
  const { email } = req.body

  // Check if the user making the request is the team leader
  const [isLeader] = await db.execute(
    `SELECT userId, role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${req.params.id} AND role = 'Project leader'`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error("Only the project leader can remove a member.")
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
    throw new Error("Can't remove the project leader.")
  }

  // Remove record from users_projects
  const [removedMember] = await db.execute(
    `DELETE FROM users_projects WHERE userId = ${user[0].id} AND projectId = ${req.params.id}`
  )

  res.status(201).json(removedMember)
})

// @desc    Update member role
// @route   PUT /api/teams/:id/members
// @access  Private
const updateMember = asyncHandler(async (req, res) => {
  const { email, role } = req.body

  // Check if the user making the request is either the project leader or the co-leader
  const [isLeader] = await db.execute(
    `SELECT userId, role FROM users_projects WHERE userId = ${req.user.id} AND projectId = ${req.params.id} AND (role = 'Project leader' OR role = 'Co-leader')`
  )

  if (isLeader.length === 0) {
    res.status(401)
    throw new Error(
      "Only the project leader and the co-leaders can change the role of a member."
    )
  }

  // Get ID of the user to update and check if it's the same as the project leader's ID
  const [user] = await db.execute(
    `SELECT id FROM users
    WHERE email = '${email}'`
  )

  // Update member role
  if (role === "Project leader") {
    // If the role we want to set is "Project leader" AND the role of the user making the request is different from "Project leader", then throw an error
    if (isLeader[0].role !== "Project leader") {
      res.status(401)
      throw new Error("Only the project leader can set the new project leader.")
    } else {
      // First we set the current project leader's role to "Co-leader"
      await db.execute(
        `UPDATE users_projects SET role = 'Co-leader' WHERE role = 'Project leader' AND projectId = ${req.params.id}`
      )
      // Then we set the user whose role we want to change to "Project leader"
      await db.execute(
        `UPDATE users_projects SET role = 'Project leader' WHERE userId = ${user[0].id} AND projectId = ${req.params.id}`
      )
    }
  } else {
    // If the role we want to set is different from project leader, we change it ONLY IF the role of the member is not project leader, as changing it would leave the project without a leader
    await db.execute(
      `UPDATE users_projects SET role = '${role}' WHERE userId = ${user[0].id} AND projectId = ${req.params.id} AND (role != 'Project leader')`
    )
  }

  res.status(201).json("Role updated")
})

module.exports = {
  createProject,
  getProjects,
  getProject,
  deleteProject,
  updateProject,
  addMember,
  removeMember,
  updateMember,
}
