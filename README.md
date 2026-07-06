# TeamPulse

![Dashboard](https://img.shields.io/badge/dashboard-auto--generated-blue)
![Data](https://img.shields.io/badge/data-JSON-green)
![Automation](https://img.shields.io/badge/GitHub%20Actions-enabled-black)

TeamPulse is a GitHub-native task tracking dashboard that turns issues and issue comments into structured JSON data, analytics, trend reports, and an automatically refreshed README.

## Features

- Task Creation & Tracking
- Contributor Participation
- Auto-generated Analytics Dashboard
- GitHub Issue Integration
- Issue Comment Commands
- Daily Archival System
- Weekly & Monthly Trend Analysis
- Contributor Leaderboards
- Automated README Updates

---

## Dashboard

| Metric | Value |
| --- | ---: |
| Total Tasks | 0 |
| Completed Tasks | 0 |
| Pending Tasks | 0 |
| Completion Rate | 0% |

---

## 📊 Daily Analytics

| Metric | Value |
| --- | --- |
| Total Tasks | 0 |
| Completed Tasks | 0 |
| Pending Tasks | 0 |
| Completion Rate | 0% |
| Top Contributor | - |
| Most Active Contributor | - |

---

## 🚨 Priority Overview

| Priority | Count |
| --- | ---: |
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 0 |

### 📊 Task Distribution

```text
Critical | -
High     | -
Medium   | -
Low      | -
```

---

## Tasks

| Task | Priority | Status | Participants |
| --- | --- | --- | --- |
| No tasks yet | - | - | - |

---

## Contributor Leaderboard

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| No contributors yet | 0 | 0 |

---

## 📈 Weekly Trends

| Metric | Value |
| --- | ---: |
| Tasks Completed This Week | 0 |
| Tasks Created This Week | 0 |
| Average Weekly Completion Rate | 0% |
| Critical Tasks Completed This Week | 0 |
| High Priority Completion Rate | 0% |
| Most Common Priority | Medium |
| Best Day | 2026-06-30 (0%) |
| Worst Day | 2026-06-30 (0%) |

## 📊 Monthly Trends

| Metric | Value |
| --- | ---: |
| Tasks Completed This Month | 6 |
| Tasks Created This Month | 10 |
| Average Monthly Completion Rate | 5% |
| Critical Tasks Completed This Month | 0 |
| High Priority Completion Rate | 0% |
| Most Common Priority | Medium |

---

## 🏆 Weekly Champions

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| No contributors yet | 0 | 0 |

## 🥇 All-Time Leaderboard

| Contributor | Joined Tasks | Completed Tasks |
| --- | ---: | ---: |
| [@kamali-sree](https://github.com/kamali-sree) | 4 | 6 |

---

## 📅 Yesterday's Summary

| Metric | Value |
| --- | --- |
| Date | 2026-07-06 |
| Tasks Completed | 0 |
| Pending Tasks | 0 |
| Completion Rate | 0% |
| Top Contributor | - |
| Most Active Contributor | - |

## 📚 Historical Reports

| Metric | Value |
| --- | --- |
| Total Archived Days | 26 |
| Latest Archive | 2026-07-06 |
| Best Day | 2026-06-11 (60%) |
| Worst Day | 2026-06-13 (0%) |

---

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

---

## Data Model

Tasks live in `data/tasks.json`, users live in `data/users.json`, daily analytics live in `data/analytics.json`, trend analytics live in `data/trends.json`, and daily history snapshots live in `data/history/YYYY-MM-DD.json`. Every task has a normalized `priority` value.

## Analytics and Contributor Insights

The Daily Analytics section is generated from `data/tasks.json` by `scripts/generate_analytics.js`. It safely handles empty task lists, stores aggregate statistics in `data/analytics.json`, and sorts contributor leaderboards by completed tasks descending.

## Priority Labels

TeamPulse reads GitHub Issue labels when an issue is imported and maps `Critical`, `High`, `Medium`, and `Low` labels to task priorities. Supported priority values are `critical`, `high`, `medium`, and `low`; missing or unknown values are stored as `medium`.

Priorities affect the task table, Priority Overview, task distribution bars, and trend analytics such as critical tasks completed, high-priority completion rate, and most common priority.

## Weekly and Monthly Trends

`scripts/generate_trends.js` reads every `data/history/YYYY-MM-DD.json` file, calculates rolling 7-day and 30-day trend summaries, and writes them to `data/trends.json`. It handles empty history folders, first-week projects, and first-month projects by returning zeroed statistics until more history exists.

## Daily Archives and Reset

TeamPulse stores immutable daily snapshots in `data/history/YYYY-MM-DD.json`. Each snapshot contains the date, daily analytics, top contributors, and the full task list for that day.

`scripts/archive_day.js` creates the history folder automatically, refreshes analytics, writes today's archive only if it does not already exist, and regenerates trend analytics after a new history file is created. Existing history files are never overwritten or deleted.

`scripts/reset_tasks.js` archives the current day first, clears `data/tasks.json` to `{ "tasks": [] }`, regenerates `data/analytics.json`, and rebuilds this README so the next day starts fresh.

## GitHub Issue Integration

When a GitHub Issue is opened, `.github/workflows/issue-to-task.yml` reads the issue title, body, number, creator, and supported priority labels, then creates a `source: "github_issue"` task in `data/tasks.json`. Duplicate imports are prevented by using the issue number as the task id, such as `issue-1`.

## Comment Commands

TeamPulse supports two GitHub Issue comment commands:

- `/join` adds the commenter to the matching task's `participants` list.
- `/complete` adds the commenter to `completedBy` and marks the task as completed.

The `.github/workflows/comment-commands.yml` workflow ignores pull request comments, unsupported commands, duplicate joins, duplicate completions, and comments on issues that do not have a matching `issue-N` task.

_Last generated: 2026-07-06T04:20:37.582Z_
