type Repo = {
  languages: {
    edges: {
      size: number;
      node: { name: string };
    }[];
  };
};

type LanguageStat = {
  name: string;
  percent: number;
};

export function calculateTopLanguages(
  repos: Repo[],
  limit = 6
): LanguageStat[] {
  const sizeMap: Record<string, number> = {};

  for (const repo of repos) {
    for (const edge of repo.languages.edges) {
      sizeMap[edge.node.name] = (sizeMap[edge.node.name] || 0) + edge.size;
    }
  }

  const entries = Object.entries(sizeMap).sort((a, b) => b[1] - a[1]);
  const top = entries.slice(0, limit);

  const totalSize = top.reduce((sum, [, size]) => sum + size, 0);
  if (totalSize === 0) return [];

  const normalized: LanguageStat[] = [];
  let accumulated = 0;

  for (let i = 0; i < top.length; i++) {
    const [name, size] = top[i];

    const percent =
      i === top.length - 1
        ? 100 - accumulated
        : Math.round((size / totalSize) * 100);

    accumulated += percent;

    normalized.push({
      name,
      percent,
    });
  }

  return normalized;
}
