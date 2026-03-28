const fetch = require("node-fetch");

const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/standings?type=0";

async function run() {
  try {
    console.log("Fetching standings from ESPN…");

    const response = await fetch(ESPN_URL);
    const text = await response.text();

    console.log("=== RAW ESPN RESPONSE (first 2000 chars) ===");
    console.log(text.substring(0, 2000));

    console.log("\n=== END RAW OUTPUT ===");
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
