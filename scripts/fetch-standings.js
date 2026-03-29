const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const MLB_URL =
  "https://statsapi.mlb.com/api/v1/standings?leagueId=104&division=204&standingsTypes=regularSeason";

async function run() {
  try {
    console.log("Fetching MLB standings...");

    const response = await fetch(MLB_URL);
    const data = await response.json();

    const records = data.records[0].teamRecords;

    // Sort standings by best record
    records.sort((a, b) => {
      const pctA = parseFloat(a.winningPercentage);
      const pctB = parseFloat(b.winningPercentage);

      if (pctA !== pctB) return pctB - pctA;
      if (a.wins !== b.wins) return b.wins - a.wins;
      return a.losses - b.losses;
    });

    // Build ESPN-style HTML
    let html = `
<style>
  .standings-table {
    width: 100%;
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    font-size: 22px;
  }

  .standings-header {
    background: #0d253f;
    color: white;
    text-align: left;
    font-weight: bold;
  }

  .standings-table th,
  .standings-table td {
    padding: 10px 8px;
    border-bottom: 1px solid #ddd;
  }

  .standings-row:nth-child(even) {
    background: #f7f7f7;
  }

  .phillies-row {
    background: #e81828 !important;
    color: white !important;
    font-weight: bold;
  }
</style>

<table class="standings-table">
  <tr class="standings-header">
    <th>Team</th>
    <th>W</th>
    <th>L</th>
    <th>Pct</th>
    <th>GB</th>
  </tr>
`;

    // Add each team row
    for (const team of records) {
      const name = team.team.name;
      const wins = team.wins;
      const losses = team.losses;
      const pct = team.winningPercentage;
      const gb = team.gamesBack === "-" ? "-" : team.gamesBack;

      const isPhillies = name.toLowerCase().includes("phillies");
      const rowClass = isPhillies ? "phillies-row" : "standings-row";

      html += `
  <tr class="${rowClass}">
    <td>${name}</td>
    <td>${wins}</td>
    <td>${losses}</td>
    <td>${pct}</td>
    <td>${gb}</td>
  </tr>
`;
    }

    html += `</table>`;

    // Write file
    const outputPath = path.join("data", "nl-east.html");
    fs.writeFileSync(outputPath, html);

    console.log("Standings written to:", outputPath);
  } catch (err) {
    console.error("Error fetching or writing standings:", err);
    process.exit(1);
  }
}

run();
