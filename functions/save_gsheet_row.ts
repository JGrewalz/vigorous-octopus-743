import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// Configuration information for the storing spreadsheet
// https://developers.google.com/sheets/api/guides/concepts#expandable-1
const GOOGLE_SPREADSHEET_RANGE = "A2:D2";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */

export const SaveGsheetRow = DefineFunction({
  callback_id: "save_gsheet_row",
  title: "Save gsheet row",
  description: "Store gitInsight data in a Google sheet",
  source_file: "functions/save_gsheet_row.ts",
  input_parameters: {
    properties: {
      googleAccessTokenId: {
        type: Schema.slack.types.oauth2,
        oauth2_provider_key: "google",
      },
      repository: {
        type: Schema.types.string,
        description: "Repository name",
      },
      clones: {
        type: Schema.types.number,
        description: "Clone count",
      },
      views: {
        type: Schema.types.number,
        description: "View count",
      },
      date: {
        type: Schema.types.string,
        description: "Date",
      },
    },
    required: ["googleAccessTokenId", "repository", "clones", "views", "date"],
  },
  output_parameters: {
    properties: {
      repository: {
        type: Schema.types.string,
        description: "Repository",
      },
    },
    required: ["repository"],
  },
});

export default SlackFunction(
  SaveGsheetRow,
  async ({ inputs, client, env }) => {
    const { repository, clones, views, date } = inputs;

    // Collect Google access token
    const auth = await client.apiCall("apps.auth.external.get", {
      external_token_id: inputs.googleAccessTokenId,
    });

    if (!auth.ok) {
      return { error: `Failed to collect Google auth token: ${auth.error}` };
    }

    // Append times to spreadsheet
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SPREADSHEET_ID}/values/${GOOGLE_SPREADSHEET_RANGE}:append?valueInputOption=USER_ENTERED`;
    const sheets = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${auth.external_token}`,
      },
      body: JSON.stringify({
        range: GOOGLE_SPREADSHEET_RANGE,
        majorDimension: "ROWS",
        values: [[repository, clones, views, date]],
      }),
    });

    if (!sheets.ok) {
      return {
        error: `Failed to save hours to the timesheet: ${sheets.statusText}`,
      };
    }

    return { outputs: { repository } };
  },
);
