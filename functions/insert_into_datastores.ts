import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const InsertIntoDatastoreFunctionDefinition = DefineFunction({
  callback_id: "insert_into_datastore",
  title: "Insert into datastore",
  description: "Adds repo and owner to datastore",
  source_file: "functions/insert_into_datastores.ts",
  input_parameters: {
    properties: {
      owner: {
        type: Schema.types.string,
        description: "The name of the owner",
      },
      repo: {
        type: Schema.types.string,
        description: "The name of the repo",
      },
    },
    required: ["owner", "repo"],
  },
});

export default SlackFunction(
  InsertIntoDatastoreFunctionDefinition,
  // Note the `async`, required since we `await` any `client` call.
  async ({ inputs, client }) => {
    // The below will create a *new* item, since we're creating a new ID:
    const uuid = crypto.randomUUID();
    // Use the client prop to call the SlackAPI
    const response = await client.apps.datastore.put({ // Here's that client property that allows us to call the SlackAPI's datastore functions
      datastore: "GitInsightsDatastore",
      item: {
        // To update an existing item, pass the `id` returned from a previous put command
        id: uuid,
        owner: inputs.owner,
        repo: inputs.repo,
      },
    });

    if (!response.ok) {
      const error = `Failed to save a row in datastore: ${response.error}`;
      return { error };
    } else {
      console.log(`A new row saved: ${response.item}`);
      return { outputs: {} };
    }
  },
);
