const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const getAllStatesDbObject = (DbObject) => {
  return {
    stateId: DbObject.state_id,
    stateName: DbObject.state_name,
    population: DbObject.population,
  };
};

//API1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT
      *
    FROM
      state;`;
  const statesArray = await db.all(getStatesQuery);
  response.send(statesArray.map((eachItem) => getAllStatesDbObject(eachItem)));
});

//API2
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateQuery = `
    SELECT * FROM state WHERE state_id = ${stateId};`;
  const dbResponse = await db.get(getStateQuery);
  response.send(getAllStatesDbObject(dbResponse));
});

const getAllDistrictsDbObject = (DbObject) => {
  return {
    districtName: DbObject.district_name,
    stateId: DbObject.state_id,
    cases: DbObject.cases,
    active: DbObject.active,
    deaths: DbObject.deaths,
  };
};

//API3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const { districtName, stateId, cases, active, deaths } = districtDetails;
  const addDistrictQuery = `INSERT INTO district 
  (district_name, state_id, cases, active, deaths) VALUES 
    (
       '${districtName}',
       '${stateId}',
       '${cases}',
       '${active}',
      '${deaths}');`;
  await db.run(addDistrictQuery);
  response.send("District Successfully Added");
});

//API4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQuery = `
    SELECT * FROM district WHERE district_id = ${districtId};`;
  const dbResponse = await db.get(getDistrictQuery);
  response.send(getAllDistrictsDbObject(dbResponse));
});

//API6
app.put("/players/:playerId/", async (request, response) => {
  const { districtId } = request.params;
  const updateDistrict = request.body;
  const { districtName, stateId, cases, active, deaths } = updateDistrict;
  const updateDistrictQuery = `UPDATE district SET 
      district_name = '${districtName}',
      state_id = '${stateId}',
      cases = '${cases}',
      active = '${active}',
      deaths = '${deaths}',
      WHERE
      district_id = ${districtId};`;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
    DELETE FROM
      district
    WHERE
      district_id = ${districtId};`;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

module.exports = app;
