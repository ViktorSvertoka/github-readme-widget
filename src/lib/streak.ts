type ContributionDay = {
  date: string;
  contributionCount: number;
};

export function calculateStreaks(
  weeks: { contributionDays: ContributionDay[] }[]
) {
  const days = weeks.flatMap((w) => w.contributionDays);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) {
      tempStreak++;
      if (currentStreak === 0) currentStreak = tempStreak;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
      if (currentStreak > 0) break;
    }
  }

  return { currentStreak, longestStreak };
}
