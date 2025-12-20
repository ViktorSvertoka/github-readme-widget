const GITHUB_API_URL = "https://api.github.com/graphql";

type GitHubResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

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
        repositories(
          first: 100
          ownerAffiliations: OWNER
          isFork: false
        ) {
          totalCount
          nodes {
            languages(first: 10) {
              edges {
                size
                node {
                  name
                }
              }
            }
          }
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
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
      variables: { login: username },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GitHub API error: ${res.status} ${res.statusText}\n${text}`
    );
  }

  const json = (await res.json()) as GitHubResponse<any>;

  if (json.errors?.length) {
    throw new Error(
      `GitHub GraphQL error: ${json.errors.map((e) => e.message).join(", ")}`
    );
  }

  if (!json.data?.user) {
    throw new Error("GitHub user not found");
  }

  return json.data.user;
}
