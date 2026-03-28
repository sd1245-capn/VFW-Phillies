const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const OUTPUT_PATH = path.join("data", "nl-east.html");

// Stable ESPN endpoint
const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/standings?type=0";

async function fetchJson(url) {
  const res = await fetch(url);
  return await res.json();
}

async function run() {
  try {
    console.log("Fetching standings from ESPN…");

    // 1. Get root standings object
    const root = await fetchJson(ESPN_URL);

    // 2. Get the list of groups (divisions)
    const groups = await fetchJson(root.children.$ref);

    // 3. Find NL East division
    const nlEastGroup = groups.items.find((g) =>
      g.name.toLowerCase().includes("nl east")
    );

    if (!nlEastGroup) {
      throw new Error("NL East division not found in ESPN data");
    }

    // 4. Fetch NL East standings
    const nlEast = await fetchJson(nlEastGroup.standings.$ref);

    let html = `
      <table style="width:100%; border-collapse: collapse; font-family: Arial;">
        <tr>
          <th style="text-align:left; padding:4px;">Team</th>
          <th style="padding:4px;">W</th>
          <th style="padding:4px;">L</th>
          <th style="padding:4px;">Pct</th>
          <th style="padding:4px;">GB</th>
        </tr>
    `;

    // 5. Loop through each team entry
    for (const entry of nlEast.entries) {
      const team = await fetchJson(entry.team.$ref);

      const stats = {};
      entry.stats.forEach((s) => (stats[s.name] = s.value));

      html += `
        <tr>
          <td style="padding:4px;">${team.displayName}</td>
          <td style="padding:4px;">${stats.wins}</td>
          <td style="padding:4px;">${stats.losses}</td>
          <td style="padding:4px;">${Number(stats.winPercent).toFixed(3)}</td>
          <td style="padding:4px;">${stats.gamesBehind}</td>
        </tr>
      `;
    }

    html += `</table>`;

    fs.mkdirSync("data", { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, html);

    console.log("Standings written to:", OUTPUT_PATH);
  } catch (err) {
    console.error("Error fetching or writing standings:", err);
    process.exit(1);
  }
}

run();
