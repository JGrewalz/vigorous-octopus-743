import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
//import { Connectors } from "deno-slack-hub/mod.ts";
import { FetchGitMetricsDefinition } from "../functions/fetch_git_metrics.ts";
import { SaveGsheetRow } from "../functions/save_gsheet_row.ts";

const GitInsightsWebhookWorkflow = DefineWorkflow({
  callback_id: "get_gitinsights",
  title: "Get GitInsight",
  description: "Get past 24hrs Git Insight metrics",
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
});

// Get Git Insights from GitHub
const gitInsights = GitInsightsWebhookWorkflow.addStep(
  FetchGitMetricsDefinition,
  {
    owner: GitInsightsWebhookWorkflow.inputs.owner,
    repo: GitInsightsWebhookWorkflow.inputs.repo,
  },
);

// Save Git Insight info in GSheets
GitInsightsWebhookWorkflow.addStep(SaveGsheetRow, {
  googleAccessTokenId: {
    credential_source: "DEVELOPER",
  },
  repository: GitInsightsWebhookWorkflow.inputs.repo,
  clones: gitInsights.outputs.yesterdayCloneCount,
  views: gitInsights.outputs.yesterdayPageView,
  date: gitInsights.outputs.yesterdayStr,
});

export default GitInsightsWebhookWorkflow;
