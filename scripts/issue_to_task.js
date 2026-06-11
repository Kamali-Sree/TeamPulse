const fs = require("fs");
const {
  ensureUser,
  getArgValue,
  loadTasks,
  loadUsers,
  normalizePriority,
  nowIso,
  saveTasks,
  saveUsers
} = require("./_utils");

function priorityFromLabels(labels) {
  const priorityLabels = new Set(["critical", "high", "medium", "low"]);

  for (const label of labels || []) {
    const name = typeof label === "string" ? label : label && label.name;
    const normalized = normalizePriority(name);

    if (priorityLabels.has(String(name || "").trim().toLowerCase())) {
      return normalized;
    }
  }

  return "medium";
}

function readIssueFromEvent(eventPath) {
  if (!eventPath || !fs.existsSync(eventPath)) {
    return null;
  }

  const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  if (!payload.issue) {
    return null;
  }

  return {
    number: payload.issue.number,
    title: payload.issue.title,
    body: payload.issue.body || "",
    username: payload.issue.user && payload.issue.user.login,
    labels: payload.issue.labels || []
  };
}

function readIssueFromArgs(args) {
  const number = getArgValue(args, "number");
  const title = getArgValue(args, "title");
  const body = getArgValue(args, "body");
  const username = getArgValue(args, "user");
  const labels = getArgValue(args, "labels")
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);

  if (!number && !title && !username) {
    return null;
  }

  return {
    number,
    title,
    body,
    username,
    labels
  };
}

const args = process.argv.slice(2);
const issue =
  readIssueFromArgs(args) ||
  readIssueFromEvent(process.env.GITHUB_EVENT_PATH);

if (!issue || !issue.number || !issue.title || !issue.username) {
  console.error(
    "Usage: node scripts/issue_to_task.js --number 1 --title \"Issue Title\" --body \"Issue Body\" --user githubUser"
  );
  console.error("In GitHub Actions, this script reads issue data from GITHUB_EVENT_PATH.");
  process.exit(1);
}

const tasksData = loadTasks();
const usersData = loadUsers();
const taskId = `issue-${issue.number}`;

const duplicate = tasksData.tasks.some((task) => task.id === taskId);

if (duplicate) {
  console.log(`Issue #${issue.number} has already been imported as ${taskId}.`);
  process.exit(0);
}

const user = ensureUser(usersData, issue.username);

tasksData.tasks.push({
  id: taskId,
  title: issue.title,
  description: issue.body || "",
  createdBy: user.username,
  createdAt: nowIso(),
  priority: priorityFromLabels(issue.labels),
  participants: [],
  completedBy: [],
  status: "pending",
  source: "github_issue"
});

saveTasks(tasksData);
saveUsers(usersData);

console.log(`Imported GitHub Issue #${issue.number} as task ${taskId}.`);
