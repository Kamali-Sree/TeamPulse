const {
  loadTasks,
  normalizeTasks,
  saveAnalytics,
  saveTasks
} = require("./_utils");

function createContributors(tasks) {
  const contributors = {};

  function ensureContributor(username) {
    if (!username) {
      return null;
    }

    if (!contributors[username]) {
      contributors[username] = {
        joinedTasks: 0,
        completedTasks: 0
      };
    }

    return contributors[username];
  }

  for (const task of tasks) {
    for (const username of task.participants || []) {
      const contributor = ensureContributor(username);
      if (contributor) {
        contributor.joinedTasks += 1;
      }
    }

    for (const username of task.completedBy || []) {
      const contributor = ensureContributor(username);
      if (contributor) {
        contributor.completedTasks += 1;
      }
    }
  }

  return contributors;
}

function sortLeaderboard(contributors) {
  return Object.entries(contributors)
    .map(([username, stats]) => ({
      username,
      joinedTasks: stats.joinedTasks,
      completedTasks: stats.completedTasks
    }))
    .sort((a, b) => {
      return (
        b.completedTasks - a.completedTasks ||
        b.joinedTasks - a.joinedTasks ||
        a.username.localeCompare(b.username)
      );
    });
}

function findTopContributor(leaderboard) {
  return leaderboard.length ? leaderboard[0].username : "";
}

function findMostActiveContributor(leaderboard) {
  const mostActive = [...leaderboard].sort((a, b) => {
    return (
      b.joinedTasks - a.joinedTasks ||
      b.completedTasks - a.completedTasks ||
      a.username.localeCompare(b.username)
    );
  });

  return mostActive.length ? mostActive[0].username : "";
}

function buildAnalytics(tasksData) {
  const tasks = normalizeTasks(tasksData).tasks;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "completed").length;
  const pendingTasks = totalTasks - completedTasks;
  const contributors = createContributors(tasks);
  const leaderboard = sortLeaderboard(contributors);

  // Keep empty repositories safe by avoiding division by zero.
  const completionRate = totalTasks === 0
    ? 0
    : Math.round((completedTasks / totalTasks) * 100);

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    completionRate,
    totalContributors: Object.keys(contributors).length,
    topContributor: findTopContributor(leaderboard),
    mostActiveContributor: findMostActiveContributor(leaderboard),
    contributors
  };
}

function generateAnalytics() {
  const tasksData = loadTasks();
  const normalizedTasks = normalizeTasks(tasksData);
  const analytics = buildAnalytics(normalizedTasks);

  saveTasks(normalizedTasks);
  saveAnalytics(analytics);

  return analytics;
}

if (require.main === module) {
  generateAnalytics();
  console.log("Analytics updated.");
}

module.exports = {
  buildAnalytics,
  createContributors,
  generateAnalytics,
  sortLeaderboard
};
