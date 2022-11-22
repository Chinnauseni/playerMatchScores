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
  response.send(playersArray.map((eachItem) => convertDbObject(eachItem)));
});

//Return a specific player
//API2
const convertDbObjects = (objectItem) => {
  return {
    playerId: objectItem.player_id,
    playerName: objectItem.player_name,
  };
};

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
       SELECT * 
       FROM player_details 
       WHERE player_id = ${playerId};`;

  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjects(player));
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
    score: objectItem.score,
    fours: objectItem.fours,
    sixes: objectItem.sixes,
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
  response.send(convertMatchDbObject(match));
});

//API5

const convertMatchDbObjects = (objectItem) => {
  return {
    matchId: objectItem.match_id,
    match: objectItem.match,
    year: objectItem.year,
    score: objectItem.score,
    fours: objectItem.fours,
    sixes: objectItem.sixes,
  };
};

app.get("/players/:playerId/matches", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchQuery = `
           SELECT * 
           FROM match_details
           ORDER BY 
           match_id=${matchId};`;

  const playerMatchDetails = await db.all(getPlayerMatchQuery);
  response.send(convertMatchDbObjects(playerMatchDetails));
});

//API6

const convertsMatchDbObject = (objectItem) => {
  return {
    matchId: objectItem.match_id,
    match: objectItem.match,
    year: objectItem.year,
    score: objectItem.score,
    fours: objectItem.fours,
    sixes: objectItem.sixes,
  };
};
app.get("/matches/:matchId/players", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
           SELECT * 
           FROM match_details
           ORDER BY 
           player_id=${playerId};`;

  const matchPlayerDetails = await db.all(getPlayerMatchQuery);
  response.send(convertsMatchDbObject(matchPlayerDetails));
});
//API7

const convertMatchesDbObject = (objectItem) => {
  return {
    matchId: objectItem.match_id,
    match: objectItem.match,
    year: objectItem.year,
    score: objectItem.score,
    fours: objectItem.fours,
    sixes: objectItem.sixes,
  };
};

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerAndScoreQuery = `
        SELECT 
        player_details.player_id AS playerId,
        player_details.player_name AS playerName,
        SUM(player_match_score.score) AS totalScore,
        SUM(player_match_score.fours) AS totalFours,
        SUM(player_match_score.sixes) AS totalSixes
        FROM player_match_score INNER JOIN player_details 
        ON player_match_score.player_id = player_details.player_id
        WHERE player_match_score.player_id ='${playerId}'
        GROUP BY  
       player_match_score.player_id;`;
  const playersScoreArray = await db.get(getPlayerAndScoreQuery);
  response.send(convertMatchesDbObject(playersScoreArray));
});

module.exports = app;
