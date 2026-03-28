const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const OUTPUT_PATH = path.join("data", "nl-east.html");
const ESPN_URL =
  "https://site.web.api.espn.com/apis/v2/sports/baseball/mlb/standings?region=us&lang=en&contentorigin=espn";

async function run() {
  try {
    console.log("Fetching standings from ESPN…");
    const response = await fetch(ESPN_URL);
    const data = await response.json();

    // ESPN 2026 structure: standings are now under data.children[x].standings.entries
    const leagueContainers = data.children || [];

    const nationalLeague = leagueContainers.find(
      (c) => c?.standings?.entries && c.name?.includes("National")
    );

    if (!nationalLeague) {
      throw new Error("National League not found in ESPN data");
    }

    const entries = nationalLeague.standings.entries;

    // Filter NL East teams
    const nlEast = entries.filter(
      (team) => team?.division?.name === "NL East"
    );

    if (nlEast.length === 0) {
      console.log("DEBUG: Available divisions:");
      console.log(entries.map((t) => t.division?.name));
      throw new Error("No NL East teams found in ESPN data");
    }

    // Build HTML
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

    nlEast.forEach((team) => {
      const stats = {};
      team.stats.forEach((s) => (stats[s.name] = s.value));

      html += `
        <tr>
          <td style="padding:4px;">${team.team.displayName}</td>
          <td style="padding:4px;">${stats.wins}</td>
          <td style="padding:4px;">${stats.losses}</td>
          <td style="padding:4px;">${Number(stats.winPercent).toFixed(3)}</td>
          <td style="padding:4px;">${stats.gamesBehind}</td>
        </tr>
      `;
    });

    html += `</table>`;

    // Ensure /data exists
    fs.mkdirSync("data", { recursive: true });

    // Write output file
    fs.writeFileSync(OUTPUT_PATH, html);

    console.log("Standings written to:", OUTPUT_PATH);
  } catch (err) {
    console.error("Error fetching or writing standings:", err);
    process.exit(1);
  }
}

run();
