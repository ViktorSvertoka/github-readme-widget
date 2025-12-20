const GITHUB_API_URL = "https://api.github.com/graphql";

type GraphQLError = {
  message: string;
};

type GitHubResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

type GitHubUser = {
  contributionsCollection: {
    contributionCalendar: {
      totalContributions: number;
      weeks: {
        contributionDays: {
          contributionCount: number;
          date: string;
        }[];
      }[];
    };
  };
  repositories: {
    totalCount: number;
    nodes: {
      languages: {
        edges: {
          size: number;
          node: {
            name: string;
          };
        }[];
      };
    }[];
  };
  repositoriesContributedTo: {
    totalCount: number;
  };
};

export async function fetchGitHubStats(username: string): Promise<GitHubUser> {
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
    },
    body: JSON.stringify({
      query,
      variables: { login: username },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API HTTP error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as GitHubResponse<{
    user: GitHubUser | null;
  }>;

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join(", "));
  }

  if (!json.data?.user) {
    throw new Error("GitHub user not found");
  }

  return json.data.user;
}
