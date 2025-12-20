import { ImageResponse } from "@vercel/og";
import { fetchGitHubStats } from "@/lib/github";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  const data = await fetchGitHubStats(username);

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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <h1 style={{ fontSize: 36, margin: 0 }}>GitHub Readme Widget</h1>
            <p style={{ margin: 0, fontSize: 20 }}>{username}</p>
          </div>

          <div
            style={{
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
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
          }}
        >
          <span style={{ fontSize: 18, color: "#555" }}>
            Total contributions
          </span>
          <span style={{ fontSize: 42, fontWeight: 700 }}>
            {
              data.contributionsCollection.contributionCalendar
                .totalContributions
            }
          </span>
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
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 16, color: "#666" }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
