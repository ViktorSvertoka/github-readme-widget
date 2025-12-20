import { ImageResponse } from "@vercel/og";
import { fetchGitHubStats } from "@/lib/github";
import { calculateStreaks } from "@/lib/streak";
import { calculateTopLanguages } from "@/lib/languages";

export const runtime = "edge";

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Liquid: "#7ab0d6",
  TypeScript: "#3178c6",
  Vue: "#41b883",
  Python: "#3572A5",
  Go: "#00ADD8",
  Java: "#b07219",
  "C#": "#178600",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Kotlin: "#A97BFF",
  Swift: "#F05138",
  Rust: "#dea584",
};

function getLangColor(name: string) {
  return LANGUAGE_COLORS[name] || "#9ca3af";
}

function normalizeTopLanguages(
  langs: { name: string; percent: number }[],
  limit = 6
) {
  const sliced = langs.slice(0, limit);
  const total = sliced.reduce((sum, l) => sum + l.percent, 0);

  if (sliced.length === 0 || total === 0) return [];

  const normalized = sliced.map((l, i) => {
    const value =
      i === sliced.length - 1
        ? 100 -
          sliced
            .slice(0, i)
            .reduce((s, x) => s + Math.round((x.percent / total) * 100), 0)
        : Math.round((l.percent / total) * 100);

    return { name: l.name, percent: value };
  });

  return normalized;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  const data = await fetchGitHubStats(username);

  const { currentStreak, longestStreak } = calculateStreaks(
    data.contributionsCollection.contributionCalendar.weeks
  );

  const rawLanguages = calculateTopLanguages(data.repositories.nodes, 6);
  const languages = normalizeTopLanguages(rawLanguages, 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 22,
          background: "#ffffff",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
          color: "#09090b",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div style={{ display: "flex", fontSize: 20, fontWeight: 600 }}>
              GitHub Stats · {username}
            </div>
            <div style={{ display: "flex", fontSize: 13, color: "#71717a" }}>
              Repos {data.repositories.totalCount} · Contributed{" "}
              {data.repositoriesContributedTo.totalCount}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 16,
              fontWeight: 600,
              color: "#6366f1",
            }}
          >
            A+
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            marginBottom: 12,
            fontSize: 13,
            color: "#09090b",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex" }}>
            Contributions{" "}
            {
              data.contributionsCollection.contributionCalendar
                .totalContributions
            }
          </div>
          <div style={{ display: "flex", color: "#71717a" }}>•</div>
          <div style={{ display: "flex" }}>Streak {currentStreak}</div>
          <div style={{ display: "flex", color: "#71717a" }}>•</div>
          <div style={{ display: "flex" }}>Longest {longestStreak}</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", fontSize: 13, color: "#71717a" }}>
            Most Used Languages
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: 10,
              borderRadius: 999,
              overflow: "hidden",
              background: "#e5e7eb",
            }}
          >
            {languages.map((lang) => (
              <div
                key={lang.name}
                style={{
                  display: "flex",
                  width: `${lang.percent}%`,
                  background: getLangColor(lang.name),
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              rowGap: 10,
              columnGap: 14,
              fontSize: 13,
            }}
          >
            {languages.map((lang) => (
              <div
                key={lang.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "48%",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: getLangColor(lang.name),
                  }}
                />
                <div style={{ display: "flex" }}>
                  {lang.name} {lang.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 900,
      height: 260,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
