import { Trigger } from "deno-slack-sdk/types.ts";
import { TriggerTypes } from "deno-slack-api/mod.ts";
import GetDailyInsightsJobWorkflow from "../workflows/get_daily_insights_job_workflow.ts";

/**
 * Scheduled triggers are an automatic type of trigger that
 * do not require any user input and repeat on a given frequency.
 * https://api.slack.com/automation/triggers/scheduled
 */
const getDailyInsightJobTrigger: Trigger<
  typeof GetDailyInsightsJobWorkflow.definition
> = {
  type: TriggerTypes.Scheduled,
  name: "Trigger a scheduled job to get daily Git insights",
  workflow: `#/workflows/${GetDailyInsightsJobWorkflow.definition.callback_id}`,
  inputs: {},
  schedule: {
    // Begin job 60 second after trigger creation
    start_time: new Date(new Date().getTime() + 60000).toISOString(),
    end_time: "2037-12-31T23:59:59Z",
    frequency: { type: "daily", repeats_every: 1 },
  },
};

export default getDailyInsightJobTrigger;
