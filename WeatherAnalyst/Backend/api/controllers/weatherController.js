'use strict';

const sqlite3 = require('sqlite3').verbose();
const sqliteJson = require('sqlite-json');

exports.read_temp_today = function(req, res) {
    let jsonExporter = openDB();
    let today = new Date();
    let todayStr = today.getFullYear() + '-'
                + ('0' + (today.getMonth()+1)).slice(-2) + '-'
                + ('0' + today.getDate()).slice(-2);
    
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded > '" + todayStr + 
               "' and stat_id = " + req.params.stationid;
    console.log(sql);
    jsonExporter.json(sql, function (err, json) {
            if (err) {
                console.log(err);
                res.status(501).send("Error getting todays temperature");
            }
            res.header("Content-Type", "application/json");
            res.send(json);
        });
};

exports.read_temp_lastweek = function(req, res) {
    let jsonExporter = openDB();
    
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    console.log(sql);
    jsonExporter.json(sql, function (err, json) {
            if (err) {
                console.log(err);
                res.status(501).send("Error getting this weeks temperature");
            }
            res.header("Content-Type", "application/json");
            res.send(json);
        });
};

exports.read_temp_range = function(req, res) {
    let jsonExporter = openDB();
    
    let start
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-" + req.query.day + " day')) \
               and stat_id=" + req.query.stationid;
    console.log(sql);
    jsonExporter.json(sql, function (err, json) {
            if (err) {
                console.log(err);
                res.status(501).send("Error getting temp range");
            }
            res.header("Content-Type", "application/json");
            res.send(json);
        });
};


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