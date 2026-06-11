const fs = require("fs");
const path = require("path");
const {
  HISTORY_DIR,
  README_FILE,
  formatPriority,
  loadAnalytics,
  loadTasks,
  loadTrends,
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

function priorityBar(count) {
  return count > 0 ? "█".repeat(count) : "-";
}

function readHistorySnapshots() {
  if (!fs.existsSync(HISTORY_DIR)) {
    return [];
  }

  return fs
    .readdirSync(HISTORY_DIR)
    .filter((fileName) => /^\d{4}-\d{2}-\d{2}\.json$/.test(fileName))
    .map((fileName) => {
      try {
        const filePath = path.join(HISTORY_DIR, fileName);
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        console.warn(`Skipping unreadable history file: ${fileName}`);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function findBestDay(history) {
  return history.reduce((best, current) => {
    if (!best || current.completionRate > best.completionRate) {
      return current;
    }

    return best;
  }, null);
}

function findWorstDay(history) {
  return history.reduce((worst, current) => {
    if (!worst || current.completionRate < worst.completionRate) {
      return current;
    }

    return worst;
  }, null);
}

function formatHistoryDay(day) {
  return day ? `${day.date} (${day.completionRate}%)` : "-";
}

function formatTrendDay(day) {
  return day ? `${day.date} (${day.completionRate}%)` : "-";
}

function buildLeaderboard(contributors) {
  return Object.entries(contributors || {})
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
}

function buildLeaderboardRows(leaderboard) {
  return leaderboard.length
    ? leaderboard
        .map((stat) => {
          return `| ${formatUser(stat.username)} | ${stat.joinedTasks || 0} | ${stat.completedTasks || 0} |`;
        })
        .join("\n")
    : "| No contributors yet | 0 | 0 |";
}

function buildReadme(tasksData, analytics, trends) {
  const tasks = normalizeTasks(tasksData).tasks;
  const history = readHistorySnapshots();
  const latestArchive = history.length ? history[history.length - 1] : null;
  const bestDay = findBestDay(history);
  const worstDay = findWorstDay(history);
  const leaderboard = buildLeaderboard(analytics.contributors);
  const weekly = trends.weekly || {};
  const monthly = trends.monthly || {};
  const contributorTrends = trends.contributorTrends || {};
  const weeklyLeaderboard = contributorTrends.weeklyLeaderboard || [];
  const allTimeLeaderboard = contributorTrends.allTimeLeaderboard || [];
  const generatedAt = new Date().toISOString();

  const taskRows = tasks.length
    ? tasks
        .map((task) => {
          return [
            escapeMarkdown(task.title),
            formatPriority(task.priority),
            statusIcon(task.status),
            formatList(task.participants)
          ].join(" | ");
        })
        .map((row) => `| ${row} |`)
        .join("\n")
    : "| No tasks yet | - | - | - |";

  const contributorRows = buildLeaderboardRows(leaderboard);
  const weeklyRows = buildLeaderboardRows(weeklyLeaderboard);
  const allTimeRows = buildLeaderboardRows(allTimeLeaderboard);

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

## 🚨 Priority Overview

Critical Tasks: ${analytics.criticalTasks || 0}

High Tasks: ${analytics.highTasks || 0}

Medium Tasks: ${analytics.mediumTasks || 0}

Low Tasks: ${analytics.lowTasks || 0}

## 📊 Task Distribution

Critical: ${priorityBar(analytics.criticalTasks || 0)}

High: ${priorityBar(analytics.highTasks || 0)}

Medium: ${priorityBar(analytics.mediumTasks || 0)}

Low: ${priorityBar(analytics.lowTasks || 0)}

## Tasks

| Task | Priority | Status | Participants |
| --- | --- | --- | --- |
${taskRows}

## Contributor Leaderboard

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
${contributorRows}

## 📈 Weekly Trends

Tasks Completed This Week: ${weekly.tasksCompleted || 0}

Tasks Created This Week: ${weekly.tasksCreated || 0}

Average Weekly Completion Rate: ${weekly.averageCompletionRate || 0}%

Critical Tasks Completed This Week: ${weekly.criticalTasksCompleted || 0}

High Priority Completion Rate: ${weekly.highPriorityCompletionRate || 0}%

Most Common Priority: ${formatPriority(weekly.mostCommonPriority)}

Best Day: ${formatTrendDay(weekly.bestDay)}

Worst Day: ${formatTrendDay(weekly.worstDay)}

## 📊 Monthly Trends

Tasks Completed This Month: ${monthly.tasksCompleted || 0}

Tasks Created This Month: ${monthly.tasksCreated || 0}

Average Monthly Completion Rate: ${monthly.averageCompletionRate || 0}%

Critical Tasks Completed This Month: ${monthly.criticalTasksCompleted || 0}

High Priority Completion Rate: ${monthly.highPriorityCompletionRate || 0}%

Most Common Priority: ${formatPriority(monthly.mostCommonPriority)}

## 🏆 Weekly Champions

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
${weeklyRows}

## 🥇 All-Time Leaderboard

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
${allTimeRows}

## 📅 Yesterday's Summary

Date: ${latestArchive ? latestArchive.date : "-"}

Tasks Completed: ${latestArchive ? latestArchive.completedTasks : 0}

Pending Tasks: ${latestArchive ? latestArchive.pendingTasks : 0}

Completion Rate: ${latestArchive ? latestArchive.completionRate : 0}%

🏆 Top Contributor
${latestArchive ? formatUser(latestArchive.topContributor) : "-"}

🔥 Most Active Contributor
${latestArchive ? formatUser(latestArchive.mostActiveContributor) : "-"}

## 📚 Historical Reports

Total Archived Days: ${history.length}

Latest Archive:
${latestArchive ? latestArchive.date : "-"}

Best Day:
${formatHistoryDay(bestDay)}

Worst Day:
${formatHistoryDay(worstDay)}

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
npm run issue-to-task -- --number 1 --title "Bug: dashboard count is wrong" --body "Pending tasks are miscounted" --user octocat --labels Critical
\`\`\`

Handle an issue comment command locally:

\`\`\`bash
npm run handle-comment -- --issue 1 --body /join --user octocat
npm run handle-comment -- --issue 1 --body /complete --user octocat
\`\`\`

Regenerate analytics:

\`\`\`bash
npm run generate-analytics
\`\`\`

Regenerate trend analytics:

\`\`\`bash
npm run generate-trends
\`\`\`

Regenerate this dashboard:

\`\`\`bash
npm run update-readme
\`\`\`

Archive the current day:

\`\`\`bash
npm run archive-day
\`\`\`

Reset tasks for a fresh day:

\`\`\`bash
npm run reset-day
\`\`\`

## Project Structure

\`\`\`text
.
|-- .github/workflows/update-readme.yml
|-- .github/workflows/issue-to-task.yml
|-- .github/workflows/comment-commands.yml
|-- .github/workflows/daily-reset.yml
|-- data/
|   |-- analytics.json
|   |-- trends.json
|   |-- history/
|   |   \`-- YYYY-MM-DD.json
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
|   |-- generate_trends.js
|   |-- archive_day.js
|   |-- reset_tasks.js
|   \`-- update_readme.js
|-- package.json
\`-- README.md
\`\`\`

## Data Model

Tasks live in \`data/tasks.json\`, users live in \`data/users.json\`, daily analytics live in \`data/analytics.json\`, trend analytics live in \`data/trends.json\`, and daily history snapshots live in \`data/history/YYYY-MM-DD.json\`. Every task has a normalized \`priority\` value.

## Analytics and Contributor Insights

The Daily Analytics section is generated from \`data/tasks.json\` by \`scripts/generate_analytics.js\`. It safely handles empty task lists, stores aggregate statistics in \`data/analytics.json\`, and sorts the contributor leaderboard by completed tasks descending.

## Priority Labels

TeamPulse reads GitHub Issue labels when an issue is imported and maps \`Critical\`, \`High\`, \`Medium\`, and \`Low\` labels to task priorities. Supported priority values are \`critical\`, \`high\`, \`medium\`, and \`low\`; missing or unknown values are stored as \`medium\`.

Priorities affect the task table, the Priority Overview, the markdown task distribution bars, and trend analytics such as critical tasks completed, high-priority completion rate, and most common priority.

## Weekly and Monthly Trends

\`scripts/generate_trends.js\` reads every \`data/history/YYYY-MM-DD.json\` file, calculates rolling 7-day and 30-day trend summaries, and writes them to \`data/trends.json\`. It handles empty history folders, first-week projects, and first-month projects by returning zeroed statistics until more history exists.

Trend leaderboards are sorted by completed tasks descending, with joined tasks and username used as stable tie-breakers.

## Daily Archives and Reset

TeamPulse stores immutable daily snapshots in \`data/history/YYYY-MM-DD.json\`. Each snapshot contains the date, daily analytics, top contributors, and the full task list for that day.

\`scripts/archive_day.js\` creates the history folder automatically, refreshes analytics, writes today's archive only if it does not already exist, and regenerates trend analytics after a new history file is created. Existing history files are never overwritten or deleted.

\`scripts/reset_tasks.js\` archives the current day first, clears \`data/tasks.json\` to \`{ "tasks": [] }\`, regenerates \`data/analytics.json\`, and rebuilds this README so the next day starts fresh.

The \`.github/workflows/daily-reset.yml\` workflow runs every day at 00:00 UTC and can also be tested manually from the GitHub Actions tab with \`workflow_dispatch\`.

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
const trends = loadTrends();

saveTasks(normalizedTasks);
fs.writeFileSync(README_FILE, buildReadme(normalizedTasks, analytics, trends));

console.log("README dashboard updated.");
