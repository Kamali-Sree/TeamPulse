const { execFileSync } = require("child_process");
const { archiveDay } = require("./archive_day");
const { saveTasks } = require("./_utils");
const { generateAnalytics } = require("./generate_analytics");
const { generateTrends } = require("./generate_trends");

function runUpdateReadme() {
  execFileSync(process.execPath, ["scripts/update_readme.js"], {
    stdio: "inherit"
  });
}

function resetTasks() {
  // Always preserve today's state before clearing tasks for the next day.
  const archive = archiveDay();
  if (!archive.file) {
    throw new Error("Daily reset stopped because no archive file was available.");
  }

  saveTasks({ tasks: [] });
  generateAnalytics();
  generateTrends();
  runUpdateReadme();

  console.log("TeamPulse tasks reset for a fresh day.");
}

if (require.main === module) {
  resetTasks();
}

module.exports = {
  resetTasks
};
