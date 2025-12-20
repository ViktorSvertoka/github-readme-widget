type Repo = {
  languages: {
    edges: {
      size: number;
      node: { name: string };
    }[];
  };
};

export function calculateTopLanguages(repos: Repo[], limit = 5) {
  const map: Record<string, number> = {};

  for (const repo of repos) {
    for (const lang of repo.languages.edges) {
      map[lang.node.name] = (map[lang.node.name] || 0) + lang.size;
    }
  }

  const total = Object.values(map).reduce((a, b) => a + b, 0);

  return Object.entries(map)
    .map(([name, size]) => ({
      name,
      percent: Math.round((size / total) * 100),
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, limit);
}
