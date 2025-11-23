const GITHUB_API_URL = "https://api.github.com/graphql";

export async function fetchGitHubStats(username: string) {
  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        repositories(ownerAffiliations: OWNER, isFork: false) {
          totalCount
        }
        repositoriesContributedTo {
          totalCount
        }
      }
    }
  `;

  const res = await fetch(GITHUB_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { login: username },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("GitHub API error");
  }

  const json = await res.json();
  return json.data.user;
}
