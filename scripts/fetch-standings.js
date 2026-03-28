const fetch = require("node-fetch");

const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/standings?type=0";

async function run() {
  try {
    console.log("Fetching standings from ESPN…");

    const response = await fetch(ESPN_URL);

    console.log("=== DEBUG: STATUS ===");
    console.log(response.status, response.statusText);

    console.log("\n=== DEBUG: HEADERS ===");
    console.log([...response.headers.entries()]);

    const text = await response.text();

    console.log("\n=== DEBUG: RAW BODY (first 2000 chars) ===");
    console.log(text.substring(0, 2000));

    console.log("\n=== END DEBUG ===");
  } catch (err) {
    console.error("=== DEBUG ERROR ===");
    console.error(err);
  }
}

run();
