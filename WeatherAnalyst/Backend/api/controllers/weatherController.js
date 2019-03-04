'use strict';

const sqlite3 = require('sqlite3').verbose();
const sqliteJson = require('sqlite-json');

exports.read_temp_today = function(req, res) {
    let jsonExporter = openDB();
    var today = new Date();
    var todayStr = today.getFullYear() + '-'
                + ('0' + (today.getMonth()+1)).slice(-2) + '-'
                + ('0' + today.getDate()).slice(-2);
    
    var whereClause = "when_recorded > '" + todayStr + "' AND stat_id = " + req.params.stationid;
    jsonExporter.json({table: 'temperature', where: whereClause}, function (err, json) {
            if (err) {
                res.status(401).send(err);
            }
            res.send(json);
        });

    db.close();
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