import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const def = DefineFunction({
  callback_id: "block_kit_modal",
  title: "Block Kit modal",
  source_file: "functions/block_kit_modal.ts",
  input_parameters: {
    properties: { interactivity: { type: Schema.slack.types.interactivity } },
    required: ["interactivity"],
  },
  output_parameters: { properties: {}, required: [] },
});

export default SlackFunction(
  def,
  // ---------------------------
  // The first handler function that opens a modal.
  // This function can be called when the workflow executes the function step.
  // ---------------------------
  async ({ inputs, client }) => {
    // Open a new modal with the end-user who interacted with the link trigger
    const response = await client.views.open({
      interactivity_pointer: inputs.interactivity.interactivity_pointer,
      view: {
        "type": "modal",
        // Note that this ID can be used for dispatching view submissions and view closed events.
        "callback_id": "first-page",
        // This option is required to be notified when this modal is closed by the user
        "notify_on_close": true,
        "submit": {
          "type": "plain_text",
          "text": "Submit",
          "emoji": true,
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true,
        },
        "title": {
          "type": "plain_text",
          "text": "GitHub Insights",
          "emoji": true,
        },
        "blocks": [
          {
            "type": "section",
            "block_id": "action_select",
            "text": {
              "type": "mrkdwn",
              "text": "Select an option from the dropdown",
            },
            "accessory": {
              "action_id": "action",
              "type": "static_select",
              "placeholder": {
                "type": "plain_text",
                "text": "Select an item",
                "emoji": true,
              },
              "options": [
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Add a Repo",
                    "emoji": true,
                  },
                  "value": "add",
                },
                {
                  "text": {
                    "type": "plain_text",
                    "text": "Delete a Repo",
                    "emoji": true,
                  },
                  "value": "delete",
                },
              ],
              "initial_option": {
                "text": {
                  "type": "plain_text",
                  "text": "Add a Repo",
                  "emoji": true,
                },
                "value": "add",
              },
            },
          },
        ],
      },
    });
    if (response.error) {
      const error =
        `Failed to open a modal in the demo workflow. Contact the app maintainers with the following information - (error: ${response.error})`;
      return { error };
    }
    return {
      // To continue with this interaction, return false for the completion
      completed: false,
    };
  },
)
  .addViewSubmissionHandler(["first-page"], async ({ view, client }) => {
    // Extract the input values from the view data

    const action = view.state.values.action_select.action.selected_option
      ?.value;
    console.log(
      "Drop down selection is  " +
        action,
    );
    if (action === "add") {
      return {
        response_action: "update",
        view: {
          type: "modal",
          callback_id: "add-repo",
          notify_on_close: true,
          title: { type: "plain_text", text: "Add a Repo" },
          submit: { type: "plain_text", text: "Next" },
          close: { type: "plain_text", text: "Close" },
          private_metadata: JSON.stringify({ action }),
          blocks: [
            {
              type: "input",
              block_id: "repo_name",
              element: { type: "plain_text_input", action_id: "action_repo" },
              label: { type: "plain_text", text: "Repo Name" },
            },
            {
              type: "input",
              block_id: "repo_owner",
              element: { type: "plain_text_input", action_id: "action_owner" },
              label: { type: "plain_text", text: "Repo Owner" },
            },
          ],
        },
      };
    } else if (action === "delete") {
      const queryResponse = await client.apps.datastore.query({
        datastore: "GitInsightsDatastore",
      });
      console.log(`query result: ${JSON.stringify(queryResponse, null, 2)}`);
      if (queryResponse.error) {
        return { error: queryResponse.error };
      }
      // Extract data from queryResponse.items and map it to create options for the dropdown
      const options = queryResponse.items.map((item) => ({
        text: { type: "plain_text", text: item.repo },
        value: item.repo,
      }));
      return {
        response_action: "update",
        view: {
          type: "modal",
          callback_id: "select-repo",
          notify_on_close: true,
          private_metadata: JSON.stringify({ action }),
          title: {
            type: "plain_text",
            text: "Select a Repo to Delete",
          },
          submit: { type: "plain_text", text: "Next" },
          close: { type: "plain_text", text: "Close" },
          blocks: [
            {
              type: "input",
              block_id: "repo_select",
              element: {
                type: "static_select",
                action_id: "action_repo_select",
                options,
              },
              label: { type: "plain_text", text: "Select a Repo" },
            },
          ],
        },
      };
    }
  })
  .addViewSubmissionHandler(
    ["add-repo", "select-repo"],
    async ({ view, client }) => {
      // Extract the selected action from private_metadata
      const { action } = JSON.parse(view.private_metadata!);
      console.log(
        "Private metadata" + action.stringify,
      );

      // Extract the input values from the view data based on the selected action
      let repoName, repoOwner;
      if (action === "add") {
        repoName = view.state.values.repo_name.action_repo.value;
        repoOwner = view.state.values.repo_owner.action_owner.value;
        // The below will create a *new* item, since we're creating a new ID:
        const uuid = crypto.randomUUID();
        // Use the client prop to call the SlackAPI
        await client.apps.datastore.put({ // Here's that client property that allows us to call the SlackAPI's datastore functions
          datastore: "GitInsightsDatastore",
          item: {
            // To update an existing item, pass the `id` returned from a previous put command
            id: uuid,
            owner: repoOwner,
            repo: repoName,
          },
        });
        /* if (!response.ok) {
          const error = `Failed to save a row in datastore: ${response.error}`;
          return { error };
        } else {
          console.log(`A new row saved: ${response.item.repo}`);
          return { outputs: {} };
        }*/
      } else if (action === "delete") {
        repoName = view.state.values.repo_select.action_repo_select
          .selected_option?.value;
        // repoOwner = view.state.values.repo_select.action_repo.selected_option?.value;
        // Use the client prop to call the SlackAPI
        const queryResponse = await client.apps.datastore.query({
          datastore: "GitInsightsDatastore",
          expression: "#repo = :repo",
          expression_attributes: { "#repo": "repo" },
          expression_values: { ":repo": repoName },
        });
        const repoToDelete = queryResponse.items[0];
        // console.log(
        //  "Deleting item with repo name" + repoToDelete.repoName.stringify +
        //    "and ID: " +
        //     repoToDelete.id,
        // );

        await client.apps.datastore.delete({
          datastore: "GitInsightsDatastore",
          id: repoToDelete.id,
        });

        /*if (!deleteResponse.ok) {
          const error =
            `Failed to delete a row in datastore: ${deleteResponse.error}`;
          return { error };
        } else {
          console.log(
            `Following repo was deleted: ${deleteResponse.item.repo}`,
          );
          return { outputs: {} };
        }*/
      }
    },
  )
  .addViewClosedHandler(
    ["first-page", "add-repo", "select-repo"],
    ({ view }) => {
      console.log(`view_closed handler called: ${JSON.stringify(view)}`);
      return { completed: true };
    },
  );
