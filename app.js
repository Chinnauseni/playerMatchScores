const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running on http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// Get a list of players
//API1

const convertDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
      SELECT * 
      FROM player_details;`;

  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray.map((eachPlayer) => convertDbObject(eachPlayer)));
});

//Return a specific player
//API2

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
       SELECT * 
       FROM player_details 
       WHERE player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(player);
});
//API3

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerQuery = `
       UPDATE 
       player_details
       SET 
       player_id=${playerId},
       player_name='${playerName}'

       WHERE player_id =${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

const convertMatchDbObject = (objectItem) => {
  return {
    matchId: objectItem.match_id,
    match: objectItem.match,
    year: objectItem.year,
  };
};

//API 4

app.get("/matches/:matchId", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerQuery = `
       SELECT * 
       FROM match_details 
       WHERE match_id = ${matchId};`;

  const match = await db.get(getPlayerQuery);
  response.send(match);
});

//API5

app.get("/players/:playerId/matches", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchQuery = `
           SELECT * 
           FROM match_details
           ORDER BY 
           match_id=${matchId};`;

  const playerMatchDetails = await db.all(getPlayerMatchQuery);
  response.send(playerMatchDetails);
});

//API6
app.get("/matches/:matchId/players", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
           SELECT * 
           FROM match_details
           ORDER BY 
           player_id=${playerId};`;

  const matchPlayerDetails = await db.all(getPlayerMatchQuery);
  response.send(matchPlayerDetails);
});
//API7

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerAndScoreQuery = `
        SELECT 
        playerId,
        playerName,
        SUM(score) AS totalScore,
        SUM(fours) AS totalFours,
        SUM(sixes) AS totalSixes
        FROM player_match_score
        ORDER DY 
        player_id =${playerId};`;
  const playersScoreArray = await db.all(getPlayerAndScoreQuery);
  response.send(playersScoreArray);
});

module.exports = app;
