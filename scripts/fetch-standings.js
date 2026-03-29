console.log("SCRIPT IS RUNNING");

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

const OUTPUT_PATH = path.join("data", "nl-east.html");

const MLB_URL =
  "https://statsapi.mlb.com/api/v1/standings?leagueId=104&division=204&standingsTypes=regularSeason";

async function run() {
  try {
    console.log("Fetching NL East standings from MLB StatsAPI…");

    const response = await fetch(MLB_URL);
    const data = await response.json();

    const records = data.records[0].teamRecords;

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

    for (const team of records) {
      html += `
        <tr>
          <td style="padding:4px;">${team.team.name}</td>
          <td style="padding:4px;">${team.wins}</td>
          <td style="padding:4px;">${team.losses}</td>
          <td style="padding:4px;">${team.winningPercentage}</td>
          <td style="padding:4px;">${team.gamesBack}</td>
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
