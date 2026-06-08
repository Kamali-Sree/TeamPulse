const {
  createSlug,
  ensureUser,
  getArgValue,
  getPositionalArgs,
  loadTasks,
  loadUsers,
  nowIso,
  saveTasks,
  saveUsers
} = require("./_utils");

const args = process.argv.slice(2);
const [title] = getPositionalArgs(args);
const description = getArgValue(args, "description");
const dueDate = getArgValue(args, "due");
const createdBy = getArgValue(args, "created-by");

if (!title) {
  console.error(
    'Usage: node scripts/create_task.js "Task title" --description "Optional details" --due 2026-06-30 --created-by githubUser'
  );
  process.exit(1);
}

const tasksData = loadTasks();
const usersData = loadUsers();
const slug = createSlug(title);

if (tasksData.tasks.some((task) => task.slug === slug)) {
  console.error(`A task named "${title}" already exists.`);
  process.exit(1);
}

let creator = "";
if (createdBy) {
  creator = ensureUser(usersData, createdBy).username;
}

const task = {
  id: `task-${Date.now()}`,
  title,
  slug,
  description,
  createdBy: creator,
  createdAt: nowIso(),
  dueDate,
  participants: creator ? [creator] : [],
  completedBy: [],
  status: "pending"
};

tasksData.tasks.push(task);

saveTasks(tasksData);
saveUsers(usersData);

console.log(`Created task: ${task.title} (${task.id})`);
