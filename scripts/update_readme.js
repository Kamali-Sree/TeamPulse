const fs = require("fs");
const {
  README_FILE,
  loadTasks,
  loadUsers,
  normalizeTasks,
  saveTasks
} = require("./_utils");

function formatUser(username) {
  return username ? `[@${username}](https://github.com/${username})` : "-";
}

function formatList(values) {
  if (!values || values.length === 0) {
    return "-";
  }

  return values.map(formatUser).join(", ");
}

function statusIcon(status) {
  if (status === "completed") {
    return "Done";
  }

  if (status === "in_progress") {
    return "Active";
  }

  return "Pending";
}

function buildContributorStats(tasks, users) {
  const stats = new Map();

  for (const user of users) {
    stats.set(user.username, {
      username: user.username,
      joinedTasks: 0,
      completedTasks: 0
    });
  }

  for (const task of tasks) {
    for (const username of task.participants || []) {
      if (!stats.has(username)) {
        stats.set(username, {
          username,
          joinedTasks: 0,
          completedTasks: 0
        });
      }

      stats.get(username).joinedTasks += 1;
    }

    for (const username of task.completedBy || []) {
      if (!stats.has(username)) {
        stats.set(username, {
          username,
          joinedTasks: 0,
          completedTasks: 0
        });
      }

      stats.get(username).completedTasks += 1;
    }
  }

  return Array.from(stats.values()).sort((a, b) => {
    return b.completedTasks - a.completedTasks || a.username.localeCompare(b.username);
  });
}

function buildReadme(tasksData, usersData) {
  const tasks = normalizeTasks(tasksData).tasks;
  const users = usersData.users || [];
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const pendingTasks = tasks.filter((task) => task.status !== "completed");
  const contributorStats = buildContributorStats(tasks, users);
  const generatedAt = new Date().toISOString();

  const taskRows = tasks.length
    ? tasks
        .map((task) => {
          return [
            task.title,
            statusIcon(task.status),
            task.dueDate || "-",
            formatList(task.participants),
            formatList(task.completedBy)
          ].join(" | ");
        })
        .map((row) => `| ${row} |`)
        .join("\n")
    : "| No tasks yet | - | - | - | - |";

  const contributorRows = contributorStats.length
    ? contributorStats
        .map((stat) => {
          return `| ${formatUser(stat.username)} | ${stat.joinedTasks} | ${stat.completedTasks} |`;
        })
        .join("\n")
    : "| No contributors yet | 0 | 0 |";

  return `# TeamPulse

A GitHub-based collaborative task tracker that stores team activity in JSON files and regenerates this README as a living dashboard.

## Dashboard

| Metric | Count |
| --- | ---: |
| Total Tasks | ${tasks.length} |
| Completed Tasks | ${completedTasks.length} |
| Pending Tasks | ${pendingTasks.length} |

## Tasks

| Task | Status | Due Date | Contributors | Completed By |
| --- | --- | --- | --- | --- |
${taskRows}

## Contributor Statistics

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
${contributorRows}

## Usage

Create a common task:

\`\`\`bash
npm run create-task -- "Write sprint notes" --description "Summarize this week's work" --due 2026-06-30 --created-by octocat
\`\`\`

Join a task:

\`\`\`bash
npm run join-task -- octocat write-sprint-notes
\`\`\`

Complete a task:

\`\`\`bash
npm run complete-task -- octocat write-sprint-notes
\`\`\`

Regenerate this dashboard:

\`\`\`bash
npm run update-readme
\`\`\`

## Project Structure

\`\`\`text
.
|-- .github/workflows/update-readme.yml
|-- data/
|   |-- tasks.json
|   \`-- users.json
|-- scripts/
|   |-- _utils.js
|   |-- create_task.js
|   |-- join_task.js
|   |-- complete_task.js
|   \`-- update_readme.js
|-- package.json
\`-- README.md
\`\`\`

## Data Model

Tasks live in \`data/tasks.json\` and users live in \`data/users.json\`. Each task tracks participants and the users who completed it, which mirrors the lightweight JSON-first architecture used by GitHub habit tracker repositories.

_Last generated: ${generatedAt}_
`;
}

const tasksData = loadTasks();
const usersData = loadUsers();
const normalizedTasks = normalizeTasks(tasksData);

saveTasks(normalizedTasks);
fs.writeFileSync(README_FILE, buildReadme(normalizedTasks, usersData));

console.log("README dashboard updated.");
