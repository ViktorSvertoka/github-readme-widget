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
};

function getLangColor(name: string) {
  return LANGUAGE_COLORS[name] || "#9ca3af";
}

function normalizeLanguages(
  langs: { name: string; percent: number }[],
  limit = 6
) {
  const sliced = langs.slice(0, limit);
  const total = sliced.reduce((s, l) => s + l.percent, 0);
  if (!total) return [];

  return sliced.map((l, i) => {
    const value =
      i === sliced.length - 1
        ? 100 -
          sliced
            .slice(0, i)
            .reduce((s, x) => s + Math.round((x.percent / total) * 100), 0)
        : Math.round((l.percent / total) * 100);

    return { name: l.name, percent: value };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const username = searchParams.get("username") || "octocat";
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";

  const COLORS =
    theme === "dark"
      ? {
          bg: "#09090b",
          text: "#fafafa",
          muted: "#a1a1aa",
          border: "#27272a",
          barBg: "#27272a",
          accent: "#6366f1",
        }
      : {
          bg: "#f7f8fa",
          text: "#09090b",
          muted: "#71717a",
          border: "#e5e7eb",
          barBg: "#e5e7eb",
          accent: "#6366f1",
        };

  const data = await fetchGitHubStats(username);
  const { currentStreak, longestStreak } = calculateStreaks(
    data.contributionsCollection.contributionCalendar.weeks
  );

  const rawLanguages = calculateTopLanguages(data.repositories.nodes, 6);
  const languages = normalizeLanguages(rawLanguages, 6);

  const half = Math.ceil(languages.length / 2);
  const left = languages.slice(0, half);
  const right = languages.slice(half);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 20,
          background: COLORS.bg,
          color: COLORS.text,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", fontSize: 18, fontWeight: 600 }}>
              GitHub Stats · {username}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 14,
                fontWeight: 600,
                color: COLORS.accent,
              }}
            >
              A+
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            <div style={{ display: "flex" }}>
              Repos {data.repositories.totalCount}
            </div>
            <div style={{ display: "flex" }}>·</div>
            <div style={{ display: "flex" }}>
              Contributed {data.repositoriesContributedTo.totalCount}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 6,
              fontSize: 12,
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
            <div style={{ display: "flex", color: COLORS.muted }}>·</div>
            <div style={{ display: "flex" }}>Streak {currentStreak}</div>
            <div style={{ display: "flex", color: COLORS.muted }}>·</div>
            <div style={{ display: "flex" }}>Longest {longestStreak}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1.1,
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 12,
              color: COLORS.muted,
            }}
          >
            Most Used Languages
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              height: 8,
              borderRadius: 999,
              overflow: "hidden",
              background: COLORS.barBg,
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
              gap: 20,
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
              }}
            >
              {left.map((lang) => (
                <div
                  key={lang.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 8,
                      height: 8,
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flex: 1,
              }}
            >
              {right.map((lang) => (
                <div
                  key={lang.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: 8,
                      height: 8,
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
      </div>
    ),
    {
      width: 900,
      height: 240,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
