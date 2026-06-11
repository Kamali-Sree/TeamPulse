# TeamPulse

A GitHub-based collaborative task tracker that stores team activity in JSON files and regenerates this README as a living dashboard.

## Dashboard

| Metric | Count |
| --- | ---: |
| Total Tasks | 5 |
| Completed Tasks | 3 |
| Pending Tasks | 2 |

# 📊 Daily Analytics

Total Tasks: 5

Completed Tasks: 3

Pending Tasks: 2

Completion Rate: 60%

🏆 Top Contributor [@kamali-sree](https://github.com/kamali-sree)

🔥 Most Active Contributor [@kamali-sree](https://github.com/kamali-sree)

## Tasks

| Task | Status | Participants | Completed By |
| --- | --- | --- | --- |
| Learn FastAPI | Pending | - | - |
| Learn React | Pending | - | - |
| Learn Docker | Done | - | [@kamali-sree](https://github.com/kamali-sree) |
| Learn Kubernetes | Done | [@kamali-sree](https://github.com/kamali-sree) | [@kamali-sree](https://github.com/kamali-sree) |
| Learn Node.js | Done | [@kamali-sree](https://github.com/kamali-sree) | [@kamali-sree](https://github.com/kamali-sree) |

## Contributor Leaderboard

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| [@kamali-sree](https://github.com/kamali-sree) | 2 | 3 |

## 📈 Weekly Trends

Tasks Completed This Week: 3

Tasks Created This Week: 5

Average Weekly Completion Rate: 60%

Best Day: 2026-06-11 (60%)

Worst Day: 2026-06-11 (60%)

## 📊 Monthly Trends

Tasks Completed This Month: 3

Tasks Created This Month: 5

Average Monthly Completion Rate: 60%

## 🏆 Weekly Champions

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| [@kamali-sree](https://github.com/kamali-sree) | 2 | 3 |

## 🥇 All-Time Leaderboard

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| [@kamali-sree](https://github.com/kamali-sree) | 2 | 3 |

## 📅 Yesterday's Summary

Date: 2026-06-11

Tasks Completed: 3

Pending Tasks: 2

Completion Rate: 60%

🏆 Top Contributor
[@kamali-sree](https://github.com/kamali-sree)

🔥 Most Active Contributor
[@kamali-sree](https://github.com/kamali-sree)

## 📚 Historical Reports

Total Archived Days: 1

Latest Archive:
2026-06-11

Best Day:
2026-06-11 (60%)

Worst Day:
2026-06-11 (60%)

## Usage

Create a common task:

```bash
npm run create-task -- "Write sprint notes" --description "Summarize this week's work" --due 2026-06-30 --created-by octocat
```

Join a task:

```bash
npm run join-task -- octocat write-sprint-notes
```

Complete a task:

```bash
npm run complete-task -- octocat write-sprint-notes
```

Import a GitHub Issue as a task locally:

```bash
npm run issue-to-task -- --number 1 --title "Bug: dashboard count is wrong" --body "Pending tasks are miscounted" --user octocat
```

Handle an issue comment command locally:

```bash
npm run handle-comment -- --issue 1 --body /join --user octocat
npm run handle-comment -- --issue 1 --body /complete --user octocat
```

Regenerate analytics:

```bash
npm run generate-analytics
```

Regenerate trend analytics:

```bash
npm run generate-trends
```

Regenerate this dashboard:

```bash
npm run update-readme
```

Archive the current day:

```bash
npm run archive-day
```

Reset tasks for a fresh day:

```bash
npm run reset-day
```

## Project Structure

```text
.
|-- .github/workflows/update-readme.yml
|-- .github/workflows/issue-to-task.yml
|-- .github/workflows/comment-commands.yml
|-- .github/workflows/daily-reset.yml
|-- data/
|   |-- analytics.json
|   |-- trends.json
|   |-- history/
|   |   `-- YYYY-MM-DD.json
|   |-- tasks.json
|   `-- users.json
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
|   `-- update_readme.js
|-- package.json
`-- README.md
```

## Data Model

Tasks live in `data/tasks.json`, users live in `data/users.json`, daily analytics live in `data/analytics.json`, trend analytics live in `data/trends.json`, and daily history snapshots live in `data/history/YYYY-MM-DD.json`.

## Analytics and Contributor Insights

The Daily Analytics section is generated from `data/tasks.json` by `scripts/generate_analytics.js`. It safely handles empty task lists, stores aggregate statistics in `data/analytics.json`, and sorts the contributor leaderboard by completed tasks descending.

## Weekly and Monthly Trends

`scripts/generate_trends.js` reads every `data/history/YYYY-MM-DD.json` file, calculates rolling 7-day and 30-day trend summaries, and writes them to `data/trends.json`. It handles empty history folders, first-week projects, and first-month projects by returning zeroed statistics until more history exists.

Trend leaderboards are sorted by completed tasks descending, with joined tasks and username used as stable tie-breakers.

## Daily Archives and Reset

TeamPulse stores immutable daily snapshots in `data/history/YYYY-MM-DD.json`. Each snapshot contains the date, daily analytics, top contributors, and the full task list for that day.

`scripts/archive_day.js` creates the history folder automatically, refreshes analytics, writes today's archive only if it does not already exist, and regenerates trend analytics after a new history file is created. Existing history files are never overwritten or deleted.

`scripts/reset_tasks.js` archives the current day first, clears `data/tasks.json` to `{ "tasks": [] }`, regenerates `data/analytics.json`, and rebuilds this README so the next day starts fresh.

The `.github/workflows/daily-reset.yml` workflow runs every day at 00:00 UTC and can also be tested manually from the GitHub Actions tab with `workflow_dispatch`.

## GitHub Issue Integration

When a GitHub Issue is opened, `.github/workflows/issue-to-task.yml` runs automatically. It reads the issue title, body, number, and creator from the GitHub event payload, creates a `source: "github_issue"` task in `data/tasks.json`, regenerates analytics, regenerates this README, and commits the updated files back to the repository.

Duplicate imports are prevented by using the issue number as the task id, such as `issue-1`.

## Comment Commands

TeamPulse supports two GitHub Issue comment commands:

- `/join` adds the commenter to the matching task's `participants` list.
- `/complete` adds the commenter to `completedBy` and marks the task as completed.

The `.github/workflows/comment-commands.yml` workflow runs whenever a new issue comment is created. It ignores pull request comments, unsupported commands, duplicate joins, duplicate completions, and comments on issues that do not have a matching `issue-N` task.

Whenever an issue is created, a contributor joins, or a contributor completes a task, TeamPulse updates `tasks.json`, regenerates `analytics.json`, rebuilds `README.md`, and commits the synchronized dashboard data.

_Last generated: 2026-06-11T16:43:54.388Z_
