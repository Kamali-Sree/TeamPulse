const fs = require("fs");
const path = require("path");
const {
  HISTORY_DIR,
  defaultTrends,
  saveTrends
} = require("./_utils");

const DAY_MS = 24 * 60 * 60 * 1000;

function parseDate(dateValue) {
  return new Date(`${dateValue}T00:00:00.000Z`);
}

function readHistorySnapshots() {
  if (!fs.existsSync(HISTORY_DIR)) {
    return [];
  }

  return fs
    .readdirSync(HISTORY_DIR)
    .filter((fileName) => /^\d{4}-\d{2}-\d{2}\.json$/.test(fileName))
    .map((fileName) => {
      try {
        const filePath = path.join(HISTORY_DIR, fileName);
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        console.warn(`Skipping unreadable history file: ${fileName}`);
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function daysBetween(startDate, endDate) {
  return Math.round((parseDate(endDate) - parseDate(startDate)) / DAY_MS);
}

function filterRecentDays(history, latestDate, dayCount) {
  return history.filter((snapshot) => {
    const age = daysBetween(snapshot.date, latestDate);
    return age >= 0 && age < dayCount;
  });
}

function averageCompletionRate(history) {
  if (history.length === 0) {
    return 0;
  }

  const total = history.reduce((sum, snapshot) => {
    return sum + (snapshot.completionRate || 0);
  }, 0);

  return Math.round(total / history.length);
}

function findBestDay(history) {
  return history.reduce((best, current) => {
    if (!best || current.completionRate > best.completionRate) {
      return current;
    }

    return best;
  }, null);
}

function findWorstDay(history) {
  return history.reduce((worst, current) => {
    if (!worst || current.completionRate < worst.completionRate) {
      return current;
    }

    return worst;
  }, null);
}

function buildContributorLeaderboard(history) {
  const contributors = {};

  function ensureContributor(username) {
    if (!username) {
      return null;
    }

    if (!contributors[username]) {
      contributors[username] = {
        username,
        joinedTasks: 0,
        completedTasks: 0
      };
    }

    return contributors[username];
  }

  for (const snapshot of history) {
    for (const task of snapshot.tasks || []) {
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
  }

  return Object.values(contributors).sort((a, b) => {
    return (
      b.completedTasks - a.completedTasks ||
      b.joinedTasks - a.joinedTasks ||
      a.username.localeCompare(b.username)
    );
  });
}

function summarizePeriod(history) {
  return {
    tasksCompleted: history.reduce((sum, snapshot) => {
      return sum + (snapshot.completedTasks || 0);
    }, 0),
    tasksCreated: history.reduce((sum, snapshot) => {
      return sum + (snapshot.totalTasks || 0);
    }, 0),
    averageCompletionRate: averageCompletionRate(history)
  };
}

function buildTrends(history) {
  if (history.length === 0) {
    return defaultTrends();
  }

  const latestDate = history[history.length - 1].date;
  const weeklyHistory = filterRecentDays(history, latestDate, 7);
  const monthlyHistory = filterRecentDays(history, latestDate, 30);
  const weeklySummary = summarizePeriod(weeklyHistory);
  const monthlySummary = summarizePeriod(monthlyHistory);
  const bestDay = findBestDay(weeklyHistory);
  const worstDay = findWorstDay(weeklyHistory);

  return {
    weekly: {
      ...weeklySummary,
      bestDay: bestDay
        ? {
            date: bestDay.date,
            completionRate: bestDay.completionRate || 0
          }
        : null,
      worstDay: worstDay
        ? {
            date: worstDay.date,
            completionRate: worstDay.completionRate || 0
          }
        : null
    },
    monthly: monthlySummary,
    contributorTrends: {
      weeklyLeaderboard: buildContributorLeaderboard(weeklyHistory),
      monthlyLeaderboard: buildContributorLeaderboard(monthlyHistory),
      allTimeLeaderboard: buildContributorLeaderboard(history)
    }
  };
}

function generateTrends() {
  const history = readHistorySnapshots();
  const trends = buildTrends(history);

  saveTrends(trends);
  return trends;
}

if (require.main === module) {
  generateTrends();
  console.log("Trend analytics updated.");
}

module.exports = {
  buildContributorLeaderboard,
  buildTrends,
  generateTrends,
  readHistorySnapshots
};
