const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const README_FILE = path.join(ROOT_DIR, "README.md");

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  const raw = fs.readFileSync(filePath, "utf8").trim();
  if (!raw) {
    return fallback;
  }

  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function loadTasks() {
  const data = readJson(TASKS_FILE, { tasks: [] });
  return Array.isArray(data.tasks) ? data : { tasks: [] };
}

function saveTasks(data) {
  writeJson(TASKS_FILE, normalizeTasks(data));
}

function loadUsers() {
  const data = readJson(USERS_FILE, { users: [] });
  return Array.isArray(data.users) ? data : { users: [] };
}

function saveUsers(data) {
  writeJson(USERS_FILE, data);
}

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
}

function createSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nowIso() {
  return new Date().toISOString();
}

function getArgValue(args, name) {
  const longName = `--${name}`;
  const index = args.indexOf(longName);

  if (index === -1) {
    return "";
  }

  const next = args[index + 1];
  return next && !next.startsWith("--") ? next : "";
}

function getPositionalArgs(args) {
  const result = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg.startsWith("--")) {
      index += 1;
      continue;
    }

    result.push(arg);
  }

  return result;
}

function ensureUser(usersData, username) {
  const normalized = normalizeUsername(username);
  if (!normalized) {
    throw new Error("A GitHub username is required.");
  }

  const existing = usersData.users.find((user) => user.username === normalized);
  if (existing) {
    return existing;
  }

  const user = {
    username: normalized,
    joinedAt: nowIso()
  };

  usersData.users.push(user);
  usersData.users.sort((a, b) => a.username.localeCompare(b.username));
  return user;
}

function findTask(tasksData, taskRef) {
  const normalizedRef = String(taskRef || "").trim().toLowerCase();
  return tasksData.tasks.find((task) => {
    const taskId = String(task.id || "").toLowerCase();
    const taskSlug = String(task.slug || "").toLowerCase();
    const taskTitle = String(task.title || "").toLowerCase();

    return (
      taskId === normalizedRef ||
      taskSlug === normalizedRef ||
      taskTitle === normalizedRef
    );
  });
}

function taskStatus(task) {
  const participants = new Set(task.participants || []);
  const completedBy = new Set(task.completedBy || []);

  if (participants.size === 0) {
    return "pending";
  }

  for (const participant of participants) {
    if (!completedBy.has(participant)) {
      return completedBy.size > 0 ? "in_progress" : "pending";
    }
  }

  return "completed";
}

function normalizeTasks(data) {
  const tasks = (data.tasks || []).map((task) => {
    const participants = Array.from(new Set(task.participants || [])).sort();
    const completedBy = Array.from(new Set(task.completedBy || [])).sort();

    return {
      ...task,
      participants,
      completedBy,
      status: taskStatus({ ...task, participants, completedBy })
    };
  });

  tasks.sort((a, b) => {
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
    return (
      statusOrder[a.status] - statusOrder[b.status] ||
      a.title.localeCompare(b.title)
    );
  });

  return { tasks };
}

module.exports = {
  README_FILE,
  TASKS_FILE,
  USERS_FILE,
  createSlug,
  ensureUser,
  findTask,
  getArgValue,
  getPositionalArgs,
  loadTasks,
  loadUsers,
  normalizeTasks,
  normalizeUsername,
  nowIso,
  saveTasks,
  saveUsers,
  taskStatus
};
