'use strict';

const sqlite3 = require('sqlite3').verbose();
const sqliteJson = require('sqlite-json');

exports.read_today_summary = function(req, res) {
    var response = {
        temp_max : 0,
        temp_min : 0,
        avg_humidity : 0,
        total_rain: 0,
        soil_temp: 0,
        soil_moist: 0,
        wind_max: 0,
        wind_avg: 0,
        wind_direction: "N",
        last_reading: "0"
    };

    //initalise search date
    let today = new Date();
    let todayStr = today.getFullYear() + '-'
                + ('0' + (today.getMonth()+1)).slice(-2) + '-'
                + ('0' + today.getDate()).slice(-2);

    let db = openDB();
    
    //get latest record in the database
    let sql = "Select MAX(when_recorded) as last_date from temperature";
    db.get(sql, [], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        
        today = new Date(row.last_date);
        todayStr = today.getFullYear() + '-'
            + ('0' + (today.getMonth()+1)).slice(-2) + '-'
            + ('0' + today.getDate()).slice(-2);   
           
        var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'};
        response.last_reading = today.toLocaleString("en-US", options);
        
        db.serialize(()=>{
            sql = "Select MAX(temperature) as temp_max, MIN(temperature) as temp_min, \
                        AVG(humidity) as avg_humidity from temperature where when_recorded > '" 
                        + todayStr + "' and stat_id = " 
                        + req.params.stationid;

            db.get(sql, [], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                
                response.temp_max = row.temp_max;
                response.temp_min = row.temp_min;
                response.avg_humidity = row.avg_humidity;       
            });

            sql = "Select MAX(todays_rain) as total_rain from rain where when_recorded >= '" 
            + todayStr + "' and stat_id = " + req.params.stationid;
            db.get(sql, [], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                
                response.total_rain = row.total_rain;     
            });

            sql = "Select AVG(soil_temperature) as soil_temp, AVG(soil_moisture) as soil_moist from soil where when_recorded >= '" + todayStr + "' and stat_id = " + req.params.stationid;
            db.get(sql, [], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                
                response.soil_temp = row.soil_temp;  
                response.soil_moist = row.soil_moist;   
            });

            sql = "Select MAX(max_speed) as wind_max, AVG(speed) as wind_avg from wind where when_recorded >= '" + todayStr + "' and stat_id = " + req.params.stationid;
            db.get(sql, [], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }
                
                let MS_TO_KMPH = 3.6;
                response.wind_max = row.wind_max*MS_TO_KMPH;  
                response.wind_avg = row.wind_avg*MS_TO_KMPH;   
            });

            sql = "Select bearing from wind where when_recorded > '" + todayStr + "' and stat_id = " + req.params.stationid;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    return console.error(err.message);
                }
                
                var cosAll = 0;
                var sinAll = 0;
                rows.forEach((row)=>{
                    var radians = row.bearing* Math.PI/180;
                    cosAll += Math.cos(radians);
                    sinAll += Math.cos(radians);
                });

                response.wind_direction = getDirection(Math.atan2(sinAll, cosAll) / (Math.PI/180));

                //Send the result
                let resp = JSON.stringify(response);
                sendResponse(res, resp);
            });

            db.close();
        });
    });
};

function getDirection(windBearing)
{
    if(windBearing > 292.5 && windBearing <=337.5){
        return "NW"
    }else if(windBearing >22.5 && windBearing <=67.5){
        return "NE"
    }else if(windBearing >67.5 && windBearing <=112.5){
        return "E"
    }else if(windBearing >112.5 && windBearing <=157.5){
        return "SE"
    }else if(windBearing >157.5 && windBearing <=202.5){
        return "S"
    }else if(windBearing >202.5 && windBearing <=247.5){
        return "SW"
    }else if(windBearing >247.5 && windBearing <=292.5){
        return "W"
    }else{
        return "N"
    }
}

exports.read_temp_today = function(req, res){
    let today = new Date();
    let todayStr = today.getFullYear() + '-'
                + ('0' + (today.getMonth()+1)).slice(-2) + '-'
                + ('0' + today.getDate()).slice(-2);
    

    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded > '" + todayStr + 
               "' and stat_id = " + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
}

exports.read_temp_lastweek = function(req, res) {
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_temp_range = function(req, res) {
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-" + req.query.day + " day')) \
               and stat_id=" + req.query.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_soil_lastweek = function(req, res) {
    let sql = "Select soil_moisture, soil_temperature, when_recorded \
               from soil where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_rain_lastweek = function(req, res) {
    let sql = "Select one_hr_rain, todays_rain, when_recorded \
               from rain where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_wind_lastweek = function(req, res) {
    let sql = "Select bearing, speed, max_speed, when_recorded \
               from wind where when_recorded  > (SELECT DATETIME('now', '-7 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};


function excecuteAndSendJSONResponse(sql, res){
    let jsonExporter = getJsonExporter();
    console.log(sql);
    jsonExporter.json(sql, function (err, json) {
        if (err) {
            console.log(err);
            res.status(501).send("Error obtaining weather data");
        }
        sendResponse(res, json);
    });
}

function sendResponse(res, json){
    res.header("Content-Type", "application/json");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.send(json);
}

function getJsonExporter(){
    let db = openDB();
    let jsonExporter = sqliteJson(db);
    return jsonExporter;
}

function openDB(){
    // open the database
    let db = new sqlite3.Database('./db/weather.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the weather database.');
    });

    return db;
}