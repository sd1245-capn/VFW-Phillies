const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const OUTPUT_PATH = path.join("data", "nl-east.html");

// NEW ESPN ENDPOINT (2026)
const ESPN_URL =
  "https://sports.core.api.espn.com/v2/sports/baseball/leagues/mlb/standings?region=us&lang=en&contentorigin=espn";

async function run() {
  try {
    console.log("Fetching standings from ESPN…");
    const response = await fetch(ESPN_URL);
    const data = await response.json();

    // Fetch the standings groups (divisions)
    const groupsRes = await fetch(data.children.$ref);
    const groupsData = await groupsRes.json();

    // Find NL East group
    const nlEastGroup = groupsData.items.find((g) =>
      g.name.includes("NL East")
    );

    if (!nlEastGroup) {
      throw new Error("NL East group not found in ESPN data");
    }

    // Fetch NL East standings
    const nlEastRes = await fetch(nlEastGroup.standings.$ref);
    const nlEastData = await nlEastRes.json();

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

    for (const entry of nlEastData.entries) {
      const teamRes = await fetch(entry.team.$ref);
      const team = await teamRes.json();

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
