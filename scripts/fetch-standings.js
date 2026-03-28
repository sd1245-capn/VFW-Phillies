const fetch = require("node-fetch");

const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/standings?type=0";

async function run() {
  try {
    console.log("Fetching standings from ESPN…");

    const response = await fetch(ESPN_URL);
    const data = await response.json();

    console.log("=== DEBUG: TOP-LEVEL KEYS ===");
    console.log(Object.keys(data));

    console.log("\n=== DEBUG: children ===");
    console.log(data.children);

    console.log("\n=== DEBUG: FULL JSON (first 1000 chars) ===");
    console.log(JSON.stringify(data).substring(0, 1000));

    console.log("\nSTOPPED BEFORE PARSING — send this output to me.");
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
