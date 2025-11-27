type ContributionDay = {
  date: string;
  contributionCount: number;
};

type StreakResult = {
  currentStreak: number;
  longestStreak: number;
};

export function calculateStreaks(
  weeks: { contributionDays: ContributionDay[] }[]
): StreakResult {
  const days = weeks.flatMap((w) => w.contributionDays);

  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      runningStreak++;
      if (currentStreak === 0) currentStreak = runningStreak;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
      if (currentStreak > 0) break;
    }
  }

  return {
    currentStreak,
    longestStreak,
  };
}
