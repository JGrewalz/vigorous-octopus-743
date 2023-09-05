import { DefineWorkflow } from "deno-slack-sdk/mod.ts";
import { RepoWorkflowFunctionDefinition } from "../functions/call_webhook_workflow.ts";

const GetDailyInsightsJobWorkflow = DefineWorkflow({
  callback_id: "get_daily_insights_job_workflow",
  title: "Get Daily Insights Job Workflow",
  description: "Get Daily Insights Job Workflow",
});

// Function to call webhook trigger
GetDailyInsightsJobWorkflow.addStep(RepoWorkflowFunctionDefinition, {});

export default GetDailyInsightsJobWorkflow;
