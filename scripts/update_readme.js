const fs = require("fs");
const {
  README_FILE,
  loadAnalytics,
  loadTasks,
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

function escapeMarkdown(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

function buildReadme(tasksData, analytics) {
  const tasks = normalizeTasks(tasksData).tasks;
  const contributors = analytics.contributors || {};
  const leaderboard = Object.entries(contributors)
    .map(([username, stats]) => ({
      username,
      joinedTasks: stats.joinedTasks || 0,
      completedTasks: stats.completedTasks || 0
    }))
    .sort((a, b) => {
      return (
        b.completedTasks - a.completedTasks ||
        b.joinedTasks - a.joinedTasks ||
        a.username.localeCompare(b.username)
      );
    });
  const generatedAt = new Date().toISOString();

  const taskRows = tasks.length
    ? tasks
        .map((task) => {
          return [
            escapeMarkdown(task.title),
            statusIcon(task.status),
            formatList(task.participants),
            formatList(task.completedBy)
          ].join(" | ");
        })
        .map((row) => `| ${row} |`)
        .join("\n")
    : "| No tasks yet | - | - | - |";

  const contributorRows = leaderboard.length
    ? leaderboard
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
| Total Tasks | ${analytics.totalTasks} |
| Completed Tasks | ${analytics.completedTasks} |
| Pending Tasks | ${analytics.pendingTasks} |

# 📊 Daily Analytics

Total Tasks: ${analytics.totalTasks}

Completed Tasks: ${analytics.completedTasks}

Pending Tasks: ${analytics.pendingTasks}

Completion Rate: ${analytics.completionRate}%

🏆 Top Contributor ${formatUser(analytics.topContributor)}

🔥 Most Active Contributor ${formatUser(analytics.mostActiveContributor)}

## Tasks

| Task | Status | Participants | Completed By |
| --- | --- | --- | --- |
${taskRows}

## Contributor Leaderboard

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

Import a GitHub Issue as a task locally:

\`\`\`bash
npm run issue-to-task -- --number 1 --title "Bug: dashboard count is wrong" --body "Pending tasks are miscounted" --user octocat
\`\`\`

Handle an issue comment command locally:

\`\`\`bash
npm run handle-comment -- --issue 1 --body /join --user octocat
npm run handle-comment -- --issue 1 --body /complete --user octocat
\`\`\`

Regenerate this dashboard:

\`\`\`bash
npm run update-readme
\`\`\`

Regenerate analytics:

\`\`\`bash
npm run generate-analytics
\`\`\`

## Project Structure

\`\`\`text
.
|-- .github/workflows/update-readme.yml
|-- .github/workflows/issue-to-task.yml
|-- .github/workflows/comment-commands.yml
|-- data/
|   |-- analytics.json
|   |-- tasks.json
|   \`-- users.json
|-- scripts/
|   |-- _utils.js
|   |-- create_task.js
|   |-- join_task.js
|   |-- complete_task.js
|   |-- issue_to_task.js
|   |-- handle_comment_command.js
|   |-- generate_analytics.js
|   \`-- update_readme.js
|-- package.json
\`-- README.md
\`\`\`

## Data Model

Tasks live in \`data/tasks.json\`, users live in \`data/users.json\`, and daily analytics live in \`data/analytics.json\`. Each task tracks participants and the users who completed it, which powers the completion rate, top contributor, most active contributor, and contributor leaderboard.

## Analytics and Contributor Insights

The Daily Analytics section is generated from \`data/tasks.json\` by \`scripts/generate_analytics.js\`. It safely handles empty task lists, stores aggregate statistics in \`data/analytics.json\`, and sorts the contributor leaderboard by completed tasks descending.

## GitHub Issue Integration

When a GitHub Issue is opened, \`.github/workflows/issue-to-task.yml\` runs automatically. It reads the issue title, body, number, and creator from the GitHub event payload, creates a \`source: "github_issue"\` task in \`data/tasks.json\`, regenerates analytics, regenerates this README, and commits the updated files back to the repository.

Duplicate imports are prevented by using the issue number as the task id, such as \`issue-1\`.

## Comment Commands

TeamPulse supports two GitHub Issue comment commands:

- \`/join\` adds the commenter to the matching task's \`participants\` list.
- \`/complete\` adds the commenter to \`completedBy\` and marks the task as completed.

The \`.github/workflows/comment-commands.yml\` workflow runs whenever a new issue comment is created. It ignores pull request comments, unsupported commands, duplicate joins, duplicate completions, and comments on issues that do not have a matching \`issue-N\` task.

Whenever an issue is created, a contributor joins, or a contributor completes a task, TeamPulse updates \`tasks.json\`, regenerates \`analytics.json\`, rebuilds \`README.md\`, and commits the synchronized dashboard data.

_Last generated: ${generatedAt}_
`;
}

const tasksData = loadTasks();
const normalizedTasks = normalizeTasks(tasksData);
const analytics = loadAnalytics();

saveTasks(normalizedTasks);
fs.writeFileSync(README_FILE, buildReadme(normalizedTasks, analytics));

console.log("README dashboard updated.");
