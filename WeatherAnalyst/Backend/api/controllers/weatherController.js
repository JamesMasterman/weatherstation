'use strict';

const sqlite3 = require('sqlite3').verbose();
const sqliteJson = require('sqlite-json');

exports.read_temp_today = function(req, res) {
    let today = new Date();
    let todayStr = today.getFullYear() + '-'
                + ('0' + (today.getMonth()+1)).slice(-2) + '-'
                + ('0' + today.getDate()).slice(-2);
    
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded > '" + todayStr + 
               "' and stat_id = " + req.params.stationid;
    sendJSONResponse(sql, res);
};

exports.read_temp_lastweek = function(req, res) {
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    sendJSONResponse(sql, res);
};

exports.read_temp_range = function(req, res) {
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-" + req.query.day + " day')) \
               and stat_id=" + req.query.stationid;
    sendJSONResponse(sql, res);
};

exports.read_soil_lastweek = function(req, res) {
    let sql = "Select soil_moisture, soil_temperature, when_recorded \
               from soil where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    sendJSONResponse(sql, res);
};

exports.read_rain_lastweek = function(req, res) {
    let sql = "Select one_hr_rain, todays_rain, when_recorded \
               from rain where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    sendJSONResponse(sql, res);
};

exports.read_wind_lastweek = function(req, res) {
    let sql = "Select bearing, speed, max_speed, when_recorded \
               from wind where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    sendJSONResponse(sql, res);
};


function sendJSONResponse(sql, res){

    let jsonExporter = openDB();
    console.log(sql);
    jsonExporter.json(sql, function (err, json) {
        if (err) {
            console.log(err);
            res.status(501).send("Error obtaining weather data");
        }
        res.header("Content-Type", "application/json");
        res.send(json);
    });
}

function openDB(){
    // open the database
    let db = new sqlite3.Database('./db/weather.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the weather database.');
    });

    let jsonExporter = sqliteJson(db);
    return jsonExporter;
}