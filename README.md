# TeamPulse

A GitHub-based collaborative task tracker that stores team activity in JSON files and regenerates this README as a living dashboard.

## Dashboard

| Metric | Count |
| --- | ---: |
| Total Tasks | 0 |
| Completed Tasks | 0 |
| Pending Tasks | 0 |

## Tasks

| Task | Status | Due Date | Contributors | Completed By |
| --- | --- | --- | --- | --- |
| No tasks yet | - | - | - | - |

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

Regenerate this dashboard:

```bash
npm run update-readme
```

## Project Structure

```text
.
|-- .github/workflows/update-readme.yml
|-- data/
|   |-- tasks.json
|   `-- users.json
|-- scripts/
|   |-- _utils.js
|   |-- create_task.js
|   |-- join_task.js
|   |-- complete_task.js
|   `-- update_readme.js
|-- package.json
`-- README.md
```

## Data Model

Tasks live in `data/tasks.json` and users live in `data/users.json`. Each task tracks participants and the users who completed it, which mirrors the lightweight JSON-first architecture used by GitHub habit tracker repositories.

_Last generated: 2026-06-08T17:06:00.223Z_
