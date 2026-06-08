const {
  ensureUser,
  findTask,
  getPositionalArgs,
  loadTasks,
  loadUsers,
  saveTasks,
  saveUsers
} = require("./_utils");

const [username, taskRef] = getPositionalArgs(process.argv.slice(2));

if (!username || !taskRef) {
  console.error("Usage: node scripts/complete_task.js githubUser task-id-or-slug");
  process.exit(1);
}

const tasksData = loadTasks();
const usersData = loadUsers();
const user = ensureUser(usersData, username);
const task = findTask(tasksData, taskRef);

if (!task) {
  console.error(`Could not find task: ${taskRef}`);
  process.exit(1);
}

task.participants = task.participants || [];
task.completedBy = task.completedBy || [];

if (!task.participants.includes(user.username)) {
  task.participants.push(user.username);
}

if (!task.completedBy.includes(user.username)) {
  task.completedBy.push(user.username);
}

saveTasks(tasksData);
saveUsers(usersData);

console.log(`${user.username} completed "${task.title}".`);
