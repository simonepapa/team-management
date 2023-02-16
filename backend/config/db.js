const mysql = require("mysql2/promise")

const pool = mysql.createPool({
  host: process.env.MYSQL_URI,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
})

pool.execute(
  `CREATE TABLE IF NOT EXISTS users (
    id            INT PRIMARY KEY auto_increment,
    name			    VARCHAR(255) NOT NULL,
    email			    VARCHAR(320) NOT NULL,
    password		  CHAR(60) NOT NULL,
    profileImage  VARCHAR(512),
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS teams (
    id            INT PRIMARY KEY auto_increment,
    name          VARCHAR(255) NOT NULL,
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS projects (
    id            INT PRIMARY KEY auto_increment,
    name          VARCHAR(255) NOT NULL,
    description   VARCHAR(512),
    status        ENUM('On track', 'Late', 'Off track') NOT NULL DEFAULT 'On track',
    dueDate       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS tasks (
    id            INT PRIMARY KEY auto_increment,
    name          VARCHAR(255) NOT NULL,
    priority      ENUM('High', 'Medium', 'Low', 'Unassigned') NOT NULL DEFAULT 'Unassigned',
    status        ENUM('Completed', 'Not completed') NOT NULL DEFAULT 'Completed',
    dueDate       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    isSubtask     BOOLEAN NOT NULL DEFAULT false,
    mainTask      INT,
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completedAt	  DATETIME on UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mainTask) REFERENCES tasks(id)
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS users_teams (
    userId        INT NOT NULL,
    teamId        INT NOT NULL,
    role          ENUM('Team leader', 'Co-leader', 'Collaborator') NOT NULL DEFAULT 'Collaborator',
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, teamId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS users_projects (
    userId        INT NOT NULL,
    projectId     INT NOT NULL,
    role          ENUM('Project leader', 'Co-leader', 'Collaborator') NOT NULL DEFAULT 'Collaborator',
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, projectId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS teams_projects (
    teamId        INT NOT NULL,
    projectId     INT NOT NULL,
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (teamId, projectId),
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS users_tasks (
    userId        INT NOT NULL,
    taskId        INT NOT NULL,
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId, taskId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
  )`
)

pool.execute(
  `CREATE TABLE IF NOT EXISTS projects_tasks (
    projectId     INT NOT NULL,
    taskId        INT NOT NULL,
    createdAt	    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    updatedAt	    DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (projectId, taskId),
    FOREIGN KEY (projectId) REFERENCES projects(id),
    FOREIGN KEY (taskId) REFERENCES tasks(id)
  )`
)

module.exports = pool
