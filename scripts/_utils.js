const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT_DIR, "data");
const TASKS_FILE = path.join(DATA_DIR, "tasks.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");
const TRENDS_FILE = path.join(DATA_DIR, "trends.json");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const README_FILE = path.join(ROOT_DIR, "README.md");
const SUPPORTED_PRIORITIES = new Set(["critical", "high", "medium", "low"]);

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

function loadAnalytics() {
  return readJson(ANALYTICS_FILE, {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    completionRate: 0,
    totalContributors: 0,
    topContributor: "",
    mostActiveContributor: "",
    criticalTasks: 0,
    highTasks: 0,
    mediumTasks: 0,
    lowTasks: 0,
    contributors: {}
  });
}

function saveAnalytics(data) {
  writeJson(ANALYTICS_FILE, data);
}

function defaultTrends() {
  return {
    weekly: {
      tasksCompleted: 0,
      tasksCreated: 0,
      averageCompletionRate: 0,
      bestDay: null,
      worstDay: null,
      criticalTasksCompleted: 0,
      highPriorityCompletionRate: 0,
      mostCommonPriority: "medium"
    },
    monthly: {
      tasksCompleted: 0,
      tasksCreated: 0,
      averageCompletionRate: 0,
      criticalTasksCompleted: 0,
      highPriorityCompletionRate: 0,
      mostCommonPriority: "medium"
    },
    contributorTrends: {
      weeklyLeaderboard: [],
      monthlyLeaderboard: [],
      allTimeLeaderboard: []
    }
  };
}

function loadTrends() {
  return readJson(TRENDS_FILE, defaultTrends());
}

function saveTrends(data) {
  writeJson(TRENDS_FILE, data);
}

function historyFileForDate(dateValue) {
  return path.join(HISTORY_DIR, `${dateValue}.json`);
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

function normalizePriority(priority) {
  const normalized = String(priority || "")
    .trim()
    .toLowerCase();

  return SUPPORTED_PRIORITIES.has(normalized) ? normalized : "medium";
}

function formatPriority(priority) {
  const normalized = normalizePriority(priority);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
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

function todayDate() {
  return nowIso().slice(0, 10);
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
  const completedBy = new Set(task.completedBy || []);

  if (completedBy.size > 0) {
    return "completed";
  }

  return "pending";
}

function normalizeTasks(data) {
  const tasks = (data.tasks || []).map((task) => {
    const participants = Array.from(new Set(task.participants || [])).sort();
    const completedBy = Array.from(new Set(task.completedBy || [])).sort();
    const priority = normalizePriority(task.priority);

    return {
      ...task,
      priority,
      participants,
      completedBy,
      status: taskStatus({ ...task, priority, participants, completedBy })
    };
  });

  tasks.sort((a, b) => {
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (
      statusOrder[a.status] - statusOrder[b.status] ||
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      a.title.localeCompare(b.title)
    );
  });

  return { tasks };
}

module.exports = {
  ANALYTICS_FILE,
  HISTORY_DIR,
  README_FILE,
  TASKS_FILE,
  TRENDS_FILE,
  USERS_FILE,
  SUPPORTED_PRIORITIES,
  createSlug,
  defaultTrends,
  ensureUser,
  findTask,
  formatPriority,
  getArgValue,
  getPositionalArgs,
  historyFileForDate,
  loadAnalytics,
  loadTasks,
  loadTrends,
  loadUsers,
  normalizeTasks,
  normalizePriority,
  normalizeUsername,
  nowIso,
  saveAnalytics,
  saveTasks,
  saveTrends,
  saveUsers,
  taskStatus,
  todayDate,
  writeJson
};
