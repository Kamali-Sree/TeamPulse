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

Regenerate this dashboard:

```bash
npm run update-readme
```

Regenerate analytics:

```bash
npm run generate-analytics
```

## Project Structure

```text
.
|-- .github/workflows/update-readme.yml
|-- .github/workflows/issue-to-task.yml
|-- .github/workflows/comment-commands.yml
|-- data/
|   |-- analytics.json
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
|   `-- update_readme.js
|-- package.json
`-- README.md
```

## Data Model

Tasks live in `data/tasks.json`, users live in `data/users.json`, and daily analytics live in `data/analytics.json`. Each task tracks participants and the users who completed it, which powers the completion rate, top contributor, most active contributor, and contributor leaderboard.

## Analytics and Contributor Insights

The Daily Analytics section is generated from `data/tasks.json` by `scripts/generate_analytics.js`. It safely handles empty task lists, stores aggregate statistics in `data/analytics.json`, and sorts the contributor leaderboard by completed tasks descending.

## GitHub Issue Integration

When a GitHub Issue is opened, `.github/workflows/issue-to-task.yml` runs automatically. It reads the issue title, body, number, and creator from the GitHub event payload, creates a `source: "github_issue"` task in `data/tasks.json`, regenerates analytics, regenerates this README, and commits the updated files back to the repository.

Duplicate imports are prevented by using the issue number as the task id, such as `issue-1`.

## Comment Commands

TeamPulse supports two GitHub Issue comment commands:

- `/join` adds the commenter to the matching task's `participants` list.
- `/complete` adds the commenter to `completedBy` and marks the task as completed.

The `.github/workflows/comment-commands.yml` workflow runs whenever a new issue comment is created. It ignores pull request comments, unsupported commands, duplicate joins, duplicate completions, and comments on issues that do not have a matching `issue-N` task.

Whenever an issue is created, a contributor joins, or a contributor completes a task, TeamPulse updates `tasks.json`, regenerates `analytics.json`, rebuilds `README.md`, and commits the synchronized dashboard data.

_Last generated: 2026-06-09T19:59:27.056Z_
