// IIM Sambalpur Schedule — Google Apps Script webhook
// Paste this into Extensions → Apps Script in your Google Sheet.
// Add an INSTALLABLE onEdit trigger (not the simple onEdit).
// Installable triggers can make external HTTP calls.

const WEBHOOK_URL = "https://your-backend.railway.app/webhook/sheets";
const TERM = "IV"; // Change per term sheet

function onEdit(e) {
  try {
    const sheet = e.source.getActiveSheet();
    if (sheet.getName().toUpperCase() !== "SCHEDULE") return;

    const range = e.range;
    const row = range.getRow();

    // Skip header row
    if (row <= 1) return;

    // Fetch the entire row (columns 1–11)
    const rowValues = sheet.getRange(row, 1, 1, 11).getValues()[0];

    const payload = {
      term: TERM,
      row_number: row,
      row_data: {
        date: formatDate(rowValues[0]),
        day: rowValues[1] || "",
        section: rowValues[2] || "",
        slot1: rowValues[3] || "",
        slot2: rowValues[4] || "",
        slot3: rowValues[5] || "",
        // column 6 is LUNCH — skip
        slot4: rowValues[7] || "",
        slot5: rowValues[8] || "",
        slot6: rowValues[9] || "",
        slot7: rowValues[10] || "",
      },
      changed_cell: {
        row: row,
        col: range.getColumn(),
        new_value: e.value || "",
        old_value: e.oldValue || "",
      },
    };

    UrlFetchApp.fetch(WEBHOOK_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
  } catch (err) {
    console.error("Webhook error:", err.message);
  }
}

function formatDate(value) {
  if (!value) return "";
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(value);
}

// Run this once manually to register the installable trigger
function createTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ScriptApp.newTrigger("onEdit")
    .forSpreadsheet(ss)
    .onEdit()
    .create();
  console.log("Trigger created successfully");
}
