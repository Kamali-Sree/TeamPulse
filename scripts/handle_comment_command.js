const fs = require("fs");
const {
  ensureUser,
  findTask,
  getArgValue,
  loadTasks,
  loadUsers,
  saveTasks,
  saveUsers
} = require("./_utils");

const SUPPORTED_COMMANDS = new Set(["/join", "/complete"]);

function normalizeCommand(commentBody) {
  const firstLine = String(commentBody || "")
    .trim()
    .split(/\r?\n/)[0]
    .trim()
    .toLowerCase();

  return SUPPORTED_COMMANDS.has(firstLine) ? firstLine : "";
}

function readCommentFromEvent(eventPath) {
  if (!eventPath || !fs.existsSync(eventPath)) {
    return null;
  }

  const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  if (!payload.issue || !payload.comment || payload.issue.pull_request) {
    return null;
  }

  return {
    issueNumber: payload.issue.number,
    body: payload.comment.body || "",
    username: payload.comment.user && payload.comment.user.login
  };
}

function readCommentFromArgs(args) {
  const issueNumber = getArgValue(args, "issue");
  const body = getArgValue(args, "body");
  const username = getArgValue(args, "user");

  if (!issueNumber && !body && !username) {
    return null;
  }

  return {
    issueNumber,
    body,
    username
  };
}

const args = process.argv.slice(2);
const comment =
  readCommentFromArgs(args) ||
  readCommentFromEvent(process.env.GITHUB_EVENT_PATH);

if (!comment || !comment.issueNumber || !comment.username) {
  console.error(
    "Usage: node scripts/handle_comment_command.js --issue 1 --body /join --user githubUser"
  );
  console.error("In GitHub Actions, this script reads comment data from GITHUB_EVENT_PATH.");
  process.exit(1);
}

const command = normalizeCommand(comment.body);
if (!command) {
  console.log("No supported TeamPulse command found. Ignoring comment.");
  process.exit(0);
}

const tasksData = loadTasks();
const usersData = loadUsers();
const task = findTask(tasksData, `issue-${comment.issueNumber}`);

if (!task) {
  console.log(`No TeamPulse task found for issue-${comment.issueNumber}.`);
  process.exit(0);
}

const user = ensureUser(usersData, comment.username);

task.participants = task.participants || [];
task.completedBy = task.completedBy || [];

if (command === "/join") {
  if (!task.participants.includes(user.username)) {
    task.participants.push(user.username);
  }

  console.log(`${user.username} joined ${task.id}.`);
}

if (command === "/complete") {
  if (!task.completedBy.includes(user.username)) {
    task.completedBy.push(user.username);
  }

  task.status = "completed";
  console.log(`${user.username} completed ${task.id}.`);
}

saveTasks(tasksData);
saveUsers(usersData);
