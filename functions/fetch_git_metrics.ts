import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

interface PageViewStats {
  count: number;
  uniques: number;
  views: PageViews[];
}

interface PageViews {
  timestamp: string;
  count: number;
  uniques: number;
}

interface CloneStats {
  count: number;
  uniques: number;
  clones: Clone[];
}

interface Clone {
  timestamp: string;
  count: number;
  uniques: number;
}

export const FetchGitMetricsDefinition = DefineFunction({
  callback_id: "fetch_git_metrics",
  title: "Fetch Git Metrics",
  description: "Fetches Git insight metrics for a repository from GitHub",
  source_file: "functions/fetch_git_metrics.ts",
  input_parameters: {
    properties: {
      owner: {
        type: Schema.types.string,
        description: "Owner of the GitHub repository",
      },
      repo: {
        type: Schema.types.string,
        description: "Name of the GitHub repository",
      },
    },
    required: ["owner", "repo"],
  },
  output_parameters: {
    properties: {
      yesterdayPageView: {
        type: Schema.types.number,
        description: "Number of Page views for the repository",
      },
      yesterdayCloneCount: {
        type: Schema.types.number,
        description: "Number of clones for the repository",
      },
      yesterdayStr: {
        type: Schema.types.string,
        description: "Date and time of the last update",
      },
    },
    required: ["yesterdayPageView", "yesterdayCloneCount", "yesterdayStr"],
  },
});

export default SlackFunction(
  FetchGitMetricsDefinition,
  async ({ inputs }) => {
    const { owner, repo } = inputs;
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer ", // TODO: Add user GIT token here
      // Authorization: "Bearer " + env.GITHUB_TOKEN,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Get clone stats
    const cloneStatsUrl =
      `https://api.github.com/repos/${owner}/${repo}/traffic/clones`;

    console.log(cloneStatsUrl);
    const cloneStatsResponse = await fetch(cloneStatsUrl, { headers });
    const cloneStatsData: CloneStats = await cloneStatsResponse.json();
    const cloneCountForYesterday = cloneStatsData.clones.find((clone) =>
      clone.timestamp.startsWith(yesterdayStr)
    );
    const yesterdayCloneCount = cloneCountForYesterday
      ? cloneCountForYesterday.count
      : 0;

    console.log(
      "Clone Count for repo" + repo + " from " + yesterdayStr + " is " +
        yesterdayCloneCount,
    );
    console.log(cloneStatsData);

    //Get page views stats
    const pageViewsStatsUrl =
      `https://api.github.com/repos/${owner}/${repo}/traffic/views`;
    const pageViewsStatsResponse = await fetch(pageViewsStatsUrl, { headers });
    const pageViewsStatsData: PageViewStats = await pageViewsStatsResponse
      .json();
    const pageViewCountForYesterday = pageViewsStatsData.views.find((view) =>
      view.timestamp.startsWith(yesterdayStr)
    );
    const yesterdayPageView = pageViewCountForYesterday
      ? pageViewCountForYesterday.count
      : 0;
    console.log(
      "Page views for repo" + repo + "on" + yesterdayStr + " is " +
        yesterdayPageView,
    );
    console.log(pageViewsStatsData);
    return {
      outputs: {
        yesterdayPageView,
        yesterdayCloneCount,
        yesterdayStr,
      },
    };
  },
);
