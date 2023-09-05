import { DefineFunction, SlackFunction } from "deno-slack-sdk/mod.ts";

export const RepoWorkflowFunctionDefinition = DefineFunction({
  callback_id: "repo_workflow",
  title: "Call webhook for each repo",
  description:
    "Iterates through a list of repositories and calls an external Slack workflow to get GitInsight info",
  source_file: "functions/call_webhook_workflow.ts",
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  RepoWorkflowFunctionDefinition,
  async ({ client }) => {
    // Define the repositories to iterate through
    const queryResponse = await client.apps.datastore.query({
      datastore: "GitInsightsDatastore",
    });

    if (!queryResponse.ok) {
      const error = `Failed to query the datastore: ${queryResponse.error}`;
      return { error };
    }

    /*const repositories = [
      { owner: "slack-samples", repo: "bolt-java-starter-template" },
      { owner: "slack-samples", repo: "deno-triage-rotation" },
      { owner: "slack-samples", repo: ".github" },
      { owner: "slack-samples", repo: "deno-function-template" },
      { owner: "slack-samples", repo: "bolt-ts-starter-template" },
      { owner: "slack-samples", repo: "deno-reverse-string" },
      { owner: "slack-samples", repo: "bolt-js-starter-template" },
      { owner: "slack-samples", repo: "deno-blank-template" },
      { owner: "slack-samples", repo: "deno-hello-world" },
      { owner: "slack-samples", repo: "deno-issue-submission" },
      { owner: "slack-samples", repo: "deno-simple-survey" },
      { owner: "slack-samples", repo: "deno-message-translator" },
      { owner: "slack-samples", repo: "deno-code-snippets" },
      { owner: "slack-samples", repo: "deno-virtual-running-buddies" },
      { owner: "slack-samples", repo: "deno-timesheet-approval" },
      { owner: "slack-samples", repo: "deno-archive-channel" },
      { owner: "slack-samples", repo: "deno-daily-channel-topic" },
      { owner: "slack-samples", repo: "deno-give-kudos" },
      { owner: "slack-samples", repo: "deno-incident-management" },
      { owner: "slack-samples", repo: "deno-request-time-off" },
      { owner: "slack-samples", repo: "deno-announcement-bot" },
      { owner: "slack-samples", repo: "deno-welcome-bot" },
      { owner: "slack-samples", repo: "bolt-python-starter-template" },
      { owner: "slack-samples", repo: "deno-starter-template" },
      { owner: "slack-samples", repo: "deno-github-functions" },
      { owner: "slack-samples", repo: "bolt-python-news-api-for-slack" },
      { owner: "slack-samples", repo: "bolt-js-slack-connect" },
      { owner: "slack-samples", repo: "send-to-slack" },
      { owner: "slack-samples", repo: "bolt-js-upgrade-app" },
      { owner: "slack-samples", repo: "deno-triage-bot" },
    ];
    */
    const repositories = queryResponse.items;
    for (const repository of repositories) {
      // Prepare the payload for the external workflow
      const payload = {
        owner: repository.owner,
        repo: repository.repo,
      };

      // Make a POST request to the external workflow's webhook URL
      const response = await fetch(
        "https://hooks.slack.com/triggers/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",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      console.log("Payload" + payload);
      // Check the response status
      if (response.ok) {
        console.log(
          `Workflow triggered for repository ${repository.owner}/${repository.repo}`,
        );
        const responseBody = await response.json();
        console.log("Response Body:", responseBody);
      } else {
        console.error(
          `Failed to trigger workflow for repository ${repository.owner}/${repository.repo}`,
        );
      }
    }

    return {
      completed: true,
      outputs: {},
    };
  },
);
