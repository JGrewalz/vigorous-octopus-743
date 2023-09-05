import { Trigger } from "deno-slack-api/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import GetGitInsightsPerRepo from "../workflows/get_insights_webhook_workflow.ts";

/**
 * Webhook trigger
 */

const trigger: Trigger<typeof GetGitInsightsPerRepo.definition> = {
  type: TriggerTypes.Webhook,
  name: "Get Insights per repo",
  description: "Webhook to get Git insights and update gsheets per repo",
  workflow: "#/workflows/get_gitinsights",
  inputs: {
    owner: {
      value: "{{data.owner}}",
    },
    repo: {
      value: "{{data.repo}}",
    },
  },
};
export default trigger;
