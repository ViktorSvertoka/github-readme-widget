export async function fetchGitHubStats(username: string) {
  const query = `
    query ($login: String!) {
      user(login: $login) {
        name
        repositories(ownerAffiliations: OWNER, isFork: false) {
          totalCount
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
          }
        }
        repositoriesContributedTo {
          totalCount
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { login: username },
    }),
  });

  const json = await res.json();
  return json.data.user;
}
