const fs = require("fs");
const {
  HISTORY_DIR,
  historyFileForDate,
  loadAnalytics,
  loadTasks,
  normalizeTasks,
  todayDate,
  writeJson
} = require("./_utils");
const { generateAnalytics } = require("./generate_analytics");

function readSnapshot(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function buildSnapshot(dateValue, tasksData, analytics) {
  const normalizedTasks = normalizeTasks(tasksData).tasks;

  return {
    date: dateValue,
    totalTasks: analytics.totalTasks || 0,
    completedTasks: analytics.completedTasks || 0,
    pendingTasks: analytics.pendingTasks || 0,
    completionRate: analytics.completionRate || 0,
    topContributor: analytics.topContributor || "",
    mostActiveContributor: analytics.mostActiveContributor || "",
    tasks: normalizedTasks
  };
}

function archiveDay(dateValue = todayDate()) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });

  const historyFile = historyFileForDate(dateValue);
  if (fs.existsSync(historyFile)) {
    console.log(`History archive already exists for ${dateValue}. Skipping.`);
    return {
      archived: false,
      file: historyFile,
      snapshot: readSnapshot(historyFile)
    };
  }

  generateAnalytics();
  const snapshot = buildSnapshot(dateValue, loadTasks(), loadAnalytics());

  // History is append-only by date: create the file once, then never overwrite it.
  writeJson(historyFile, snapshot);
  console.log(`Archived TeamPulse day to ${historyFile}.`);

  return {
    archived: true,
    file: historyFile,
    snapshot
  };
}

if (require.main === module) {
  archiveDay();
}

module.exports = {
  archiveDay,
  buildSnapshot,
  readSnapshot
};
