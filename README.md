# TeamPulse

A GitHub-based collaborative task tracker that stores team activity in JSON files and regenerates this README as a living dashboard.

## Dashboard

| Metric | Count |
| --- | ---: |
| Total Tasks | 1 |
| Completed Tasks | 0 |
| Pending Tasks | 1 |

## Tasks

| Task | Status | Due Date | Contributors | Completed By |
| --- | --- | --- | --- | --- |
| Learn React | Pending | - | - | - |

## Contributor Statistics

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| No contributors yet | 0 | 0 |

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

Regenerate this dashboard:

```bash
npm run update-readme
```

## Project Structure

```text
.
|-- .github/workflows/update-readme.yml
|-- .github/workflows/issue-to-task.yml
|-- data/
|   |-- tasks.json
|   `-- users.json
|-- scripts/
|   |-- _utils.js
|   |-- create_task.js
|   |-- join_task.js
|   |-- complete_task.js
|   |-- issue_to_task.js
|   `-- update_readme.js
|-- package.json
`-- README.md
```

## Data Model

Tasks live in `data/tasks.json` and users live in `data/users.json`. Each task tracks participants and the users who completed it, which mirrors the lightweight JSON-first architecture used by GitHub habit tracker repositories.

## GitHub Issue Integration

When a GitHub Issue is opened, `.github/workflows/issue-to-task.yml` runs automatically. It reads the issue title, body, number, and creator from the GitHub event payload, creates a `source: "github_issue"` task in `data/tasks.json`, regenerates this README, and commits the updated files back to the repository.

Duplicate imports are prevented by using the issue number as the task id, such as `issue-1`.

_Last generated: 2026-06-08T18:01:08.575Z_
