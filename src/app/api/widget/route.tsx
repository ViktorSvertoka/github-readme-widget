import { ImageResponse } from "@vercel/og";
import { fetchGitHubStats } from "@/lib/github";
import { calculateStreaks } from "@/lib/streak";
import { calculateTopLanguages } from "@/lib/languages";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  const data = await fetchGitHubStats(username);

  const { currentStreak, longestStreak } = calculateStreaks(
    data.contributionsCollection.contributionCalendar.weeks
  );

  const topLanguages = calculateTopLanguages(data.repositories.nodes);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 48,
          background: "#f6f8fa",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 36,
                fontWeight: 700,
              }}
            >
              GitHub Readme Widget
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 20,
              }}
            >
              {username}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              color: "#6b5cff",
            }}
          >
            A+
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 40,
          }}
        >
          <Stat label="Repositories" value={data.repositories.totalCount} />
          <Stat
            label="Contributed to"
            value={data.repositoriesContributedTo.totalCount}
          />
          <Stat label="Current streak" value={currentStreak} />
          <Stat label="Longest streak" value={longestStreak} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#555",
            }}
          >
            Total contributions
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            {
              data.contributionsCollection.contributionCalendar
                .totalContributions
            }
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#555",
            }}
          >
            Most Used Languages
          </div>

          {topLanguages.map((lang) => (
            <div
              key={lang.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 16,
              }}
            >
              <div style={{ display: "flex" }}>{lang.name}</div>
              <div style={{ display: "flex" }}>{lang.percent}%</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 500,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 16,
          color: "#666",
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 28,
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}
