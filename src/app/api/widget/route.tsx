import { ImageResponse } from "@vercel/og";
import { fetchGitHubStats } from "@/lib/github";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") || "octocat";

  let totalContributions = 0;

  try {
    const data = await fetchGitHubStats(username);
    totalContributions =
      data.contributionsCollection.contributionCalendar.totalContributions;
  } catch {
    totalContributions = 0;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 48,
          background: "#f6f8fa",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h1 style={{ fontSize: 40, margin: 0 }}>GitHub Readme Widget</h1>

          <p style={{ fontSize: 24, margin: 0 }}>User: {username}</p>

          <p style={{ fontSize: 22, margin: 0 }}>
            Total contributions: {totalContributions}
          </p>
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
