import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";
import GitInsightsWorkflow from "../workflows/git_insights_workflow.ts";

/**
 * Triggers determine when workflows are executed. A trigger file describes a
 * scenario in which a workflow should be run, such as a user clicking a link.
 * Learn more: https://api.slack.com/automation/triggers/link
 */
const getGitInsightsShortcut: Trigger<
  typeof GitInsightsWorkflow.definition
> = {
  type: TriggerTypes.Shortcut,
  name: "Manage GitInsights",
  description: "Manage GitHub repo for GitInsights........",
  workflow: `#/workflows/${GitInsightsWorkflow.definition.callback_id}`,
  inputs: {
    interactivity: {
      value: TriggerContextData.Shortcut.interactivity,
    },
    channel: {
      value: TriggerContextData.Shortcut.channel_id,
    },
  },
};

export default getGitInsightsShortcut;
