import { Manifest } from "deno-slack-sdk/mod.ts";
import GitInsightsWorkflow from "./workflows/git_insights_workflow.ts";
import { FetchGitMetricsDefinition } from "./functions/fetch_git_metrics.ts";
import GoogleProvider from "./external_auth/google_provider.ts";
import { SaveGsheetRow } from "./functions/save_gsheet_row.ts";
import { RepoWorkflowFunctionDefinition } from "./functions/call_webhook_workflow.ts";
import GitInsightsWebhookWorkflow from "./workflows/get_insights_webhook_workflow.ts";
import GetDailyInsightsJobWorkflow from "./workflows/get_daily_insights_job_workflow.ts";
import GitInsightsDatastore from "./datastores/git_insights_datastore.ts";
import { InsertIntoDatastoreFunctionDefinition } from "./functions/insert_into_datastores.ts";
//import BlockKitModal from "./functions/block_kit_modal.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "vigorous-octopus-743",
  description: "A workflow to get GitHib insights for Slack samples",
  icon: "assets/default_new_app_icon.png",
  workflows: [
    GitInsightsWorkflow,
    GitInsightsWebhookWorkflow,
    GetDailyInsightsJobWorkflow,
  ],
  functions: [
    FetchGitMetricsDefinition,
    SaveGsheetRow,
    RepoWorkflowFunctionDefinition,
    InsertIntoDatastoreFunctionDefinition,
  ],
  externalAuthProviders: [GoogleProvider],
  outgoingDomains: [
    "api.github.com",
    "sheets.googleapis.com",
    "hooks.slack.com",
  ],
  datastores: [GitInsightsDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
