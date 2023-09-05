import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
//import { Connectors } from "deno-slack-hub/mod.ts";
//import { FetchGitMetricsDefinition } from "../functions/fetch_git_metrics.ts";
//import { SaveGsheetRow } from "../functions/save_gsheet_row.ts";
//import { InsertIntoDatastoreFunctionDefinition } from "../functions/insert_into_datastores.ts";
import { def as blockKit } from "../functions/block_kit_modal.ts";

const GitInsightsWorkflow = DefineWorkflow({
  callback_id: "get_gitinsights_enter_repo",
  title: "Get GitInsight.................",
  description: "Get past 24hrs Git Insight metrics",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      }, /*
      owner: {
        type: Schema.types.string,
        description: "Owner of the GitHub repository",
      },
      repo: {
        type: Schema.types.string,
        description: "Name of the GitHub repository",
      },*/
    },
    required: ["interactivity"],
  },
});

GitInsightsWorkflow.addStep(blockKit, {
  interactivity: GitInsightsWorkflow.inputs.interactivity,
});

/*
const inputForm = GitInsightsWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "Repo details",
    interactivity: GitInsightsWorkflow.inputs.interactivity,
    submit_label: "Submit Info",
    fields: {
      elements: [{
        name: "owner",
        title: "Owner of the repo",
        type: Schema.types.string,
      }, {
        name: "repo",
        title: "Repo name",
        type: Schema.types.string,
      }],
      required: ["owner", "repo"],
    },
  },
);
// Get Git Insights from GitHub

const gitInsights = GitInsightsWorkflow.addStep(FetchGitMetricsDefinition, {
  owner: inputForm.outputs.fields.owner,
  repo: inputForm.outputs.fields.repo,
});

// Same Git Insight info in GSheets
GitInsightsWorkflow.addStep(SaveGsheetRow, {
  googleAccessTokenId: {
    credential_source: "DEVELOPER",
  },
  repository: inputForm.outputs.fields.repo,
  clones: gitInsights.outputs.yesterdayCloneCount,
  views: gitInsights.outputs.yesterdayPageView,
  date: gitInsights.outputs.yesterdayStr,
});

//Add repo and name to datastore
GitInsightsWorkflow.addStep(InsertIntoDatastoreFunctionDefinition, {
  owner: inputForm.outputs.fields.owner,
  repo: inputForm.outputs.fields.repo,
});

//send message to channel
GitInsightsWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: GitInsightsWorkflow.inputs.channel,
  message: "Repo" + inputForm.outputs.fields.repo + "was added",
});
*/
export default GitInsightsWorkflow;
