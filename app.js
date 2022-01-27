const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Database Error ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
//CALL BACK FUNC
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
// GET ALL PLAYERS
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT * FROM cricket_team`;
  const allPlayersArray = await db.all(getPlayersQuery);
  response.send(
    allPlayersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});
//GET SINGLE PLAYER
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerByIdQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const result = await db.get(getPlayerByIdQuery);
  response.send(convertDbObjectToResponseObject(result));
});

// POST METHOD

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name, 
        jersey_number, 
        role)
    VALUES
      (
       '${playerName}',
        ${jerseyNumber},
        '${role}'
      );`;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

//UPDATE PLAYER
app.put("/players/:playerId/", (request, response) => {
  const updatePlyerDetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = updatePlyerDetails;
  const updateQuery = `UPDATE cricket_team SET player_name ='${playerName}', 
        jersey_number= ${jerseyNumber}, 
        role='${role}'
        WHERE player_id = ${playerId};`;
  const dbResponse = db.run(updateQuery);
  response.send("Player Details Updated");
});

//DELETE
app.delete("/players/:playerId/", (request, response) => {
  const { playerId } = request.params;

  const deleteQuery = `DELETE FROM cricket_team 
        WHERE player_id = ${playerId};`;
  const dbResponse = db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
