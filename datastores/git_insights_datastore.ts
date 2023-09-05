import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/automation/datastores
 */
const GitInsightsDatastore = DefineDatastore({
  name: "GitInsightsDatastore",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    owner: {
      type: Schema.types.string,
    },
    repo: {
      type: Schema.types.string,
    },
  },
});

export default GitInsightsDatastore;
