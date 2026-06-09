# TeamPulse

A GitHub-based collaborative task tracker that stores team activity in JSON files and regenerates this README as a living dashboard.

## Dashboard

| Metric | Count |
| --- | ---: |
| Total Tasks | 5 |
| Completed Tasks | 2 |
| Pending Tasks | 3 |

## Tasks

| Task | Status | Participants | Completed By |
| --- | --- | --- | --- |
| Learn FastAPI | Pending | - | - |
| Learn Kubernetes | Pending | [@kamali-sree](https://github.com/kamali-sree) | - |
| Learn React | Pending | - | - |
| Learn Docker | Done | - | [@kamali-sree](https://github.com/kamali-sree) |
| Learn Node.js | Done | [@kamali-sree](https://github.com/kamali-sree) | [@kamali-sree](https://github.com/kamali-sree) |

## Contributor Statistics

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| [@kamali-sree](https://github.com/kamali-sree) | 2 | 2 |

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

## Project Structure

```text
.
|-- .github/workflows/update-readme.yml
|-- .github/workflows/issue-to-task.yml
|-- .github/workflows/comment-commands.yml
|-- data/
|   |-- tasks.json
|   `-- users.json
|-- scripts/
|   |-- _utils.js
|   |-- create_task.js
|   |-- join_task.js
|   |-- complete_task.js
|   |-- issue_to_task.js
|   |-- handle_comment_command.js
|   `-- update_readme.js
|-- package.json
`-- README.md
```

## Data Model

Tasks live in `data/tasks.json` and users live in `data/users.json`. Each task tracks participants and the users who completed it, which mirrors the lightweight JSON-first architecture used by GitHub habit tracker repositories.

## GitHub Issue Integration

When a GitHub Issue is opened, `.github/workflows/issue-to-task.yml` runs automatically. It reads the issue title, body, number, and creator from the GitHub event payload, creates a `source: "github_issue"` task in `data/tasks.json`, regenerates this README, and commits the updated files back to the repository.

Duplicate imports are prevented by using the issue number as the task id, such as `issue-1`.

## Comment Commands

TeamPulse supports two GitHub Issue comment commands:

- `/join` adds the commenter to the matching task's `participants` list.
- `/complete` adds the commenter to `completedBy` and marks the task as completed.

The `.github/workflows/comment-commands.yml` workflow runs whenever a new issue comment is created. It ignores pull request comments, unsupported commands, duplicate joins, duplicate completions, and comments on issues that do not have a matching `issue-N` task.

_Last generated: 2026-06-09T19:43:58.695Z_
