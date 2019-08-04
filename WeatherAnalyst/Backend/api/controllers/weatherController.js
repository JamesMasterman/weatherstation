'use strict';

const sqlite3 = require('sqlite3').verbose();
const sqliteJson = require('sqlite-json');

let MS_TO_KMPH = 3.6;
const WIND_SPEED_BINS = 5;
const directionName = ['N', 'NE', 'E', 'SE','S', 'SW', 'W', 'NW'];
const binName = ['0-10', '10-20', '20-30', '30-40', '40+'];

exports.read_today_summary = function (req, res) {
    var response = {
        temp_max: 0,
        temp_min: 0,
        avg_humidity: 0,
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
    let todayStr = "";

    let db = openDB();

    //get latest record in the database
    let sql = "Select MAX(when_recorded) as last_date from temperature";
    db.get(sql, [], (err, row) => {
        if (err) {
            return console.error(err.message);
        }

        today = new Date(row.last_date);
        todayStr = today.getFullYear() + '-'
            + ('0' + (today.getMonth() + 1)).slice(-2) + '-'
            + ('0' + today.getDate()).slice(-2);

        var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
        response.last_reading = today.toLocaleString("en-US", options);

        db.serialize(() => {
            sql = "Select MAX(temperature) as temp_max, MIN(temperature) as temp_min, \
                        AVG(humidity) as avg_humidity from temperature where when_recorded >= '"
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

            sql = "Select todays_rain as total_rain from rain\
                    where when_recorded = (select MAX(when_recorded) from rain)\
                    and stat_id = " + req.params.stationid;

            db.get(sql, [], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }

                response.total_rain = row.total_rain;
            });

            sql = "Select AVG(soil_temperature) as soil_temp, AVG(soil_moisture) as soil_moist\
                    from soil where when_recorded = (select MAX(when_recorded) from soil)\
                     and stat_id = " + req.params.stationid;
            db.get(sql, [], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }

                response.soil_temp = row.soil_temp;
                response.soil_moist = row.soil_moist;
            });

            sql = "Select MAX(max_speed) as wind_max, AVG(speed) as wind_avg from wind\
             where when_recorded = (select MAX(when_recorded) from wind) and stat_id = " + req.params.stationid;
            db.get(sql, [], (err, row) => {
                if (err) {
                    return console.error(err.message);
                }

                response.wind_max = row.wind_max * MS_TO_KMPH;
                response.wind_avg = row.wind_avg * MS_TO_KMPH;
            });

            sql = "Select bearing, speed from wind where when_recorded > '" + todayStr + "' and stat_id = " + req.params.stationid;
            db.all(sql, [], (err, rows) => {
                if (err) {
                    return console.error(err.message);
                }

                var cosAll = 0;
                var sinAll = 0;
                rows.forEach((row) => {
                    var radians = row.bearing * Math.PI / 180;
                    cosAll += (Math.cos(radians) * row.speed);
                    sinAll += (Math.sin(radians) * row.speed);
                });

                response.wind_direction = getDirection(Math.atan2(sinAll, cosAll) / (Math.PI / 180));

                //Send the result
                let resp = JSON.stringify(response);
                sendResponse(res, resp);
            });

            db.close();
        });
    });
};

exports.read_year_to_date_summary_stats = function (req, res) {
    var response = {
        year: 0,
        month: 0,
        yearly_total_rain: 0,
        yearly_hottest_day: new Date(),
        yearly_hottest_temp: 0,
        yearly_coldest_day: new Date(),
        yearly_coldest_temp: 0,
        yearly_max_wind: 0,
        yearly_windiest_day: new Date(),
        longest_dry_spell_days: 0,
        longest_dry_spell_start: new Date(),
        monthly_total_rain: 0,
        monthly_hottest_day: 0,
        monthly_coldest_day: 0
    };

    //initalise search date

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();
    let db = openDB();

    response.year = year;
    response.month = month;

    var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    console.log("Year is " + year);

    //get latest record in the database       
    db.serialize(() => {
        let sql = "Select Sum(one_hr_rain) as year_rain \
                    from rain where strftime('%Y', when_recorded) = '" + year + "'";

        db.get(sql, [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }

            response.yearly_total_rain = row.year_rain;
        });

        sql = "Select Max(temperature) as max_temp, when_recorded from temperature\
                where strftime('%Y', when_recorded) = '" + year + "'";

        db.get(sql, [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }

            response.yearly_hottest_temp = row.max_temp;
            var hottestDay = new Date(row.when_recorded);
            response.yearly_hottest_day = hottestDay.toLocaleString("en-US", options);
        });

        let cutoffStr = '2019-02-27';       
        sql = "Select Min(temperature) as min_temp, when_recorded from temperature\
        where strftime('%Y', when_recorded) = '" + year + "' and when_recorded > '" + cutoffStr + "' and stat_id = 1";

        console.log(sql);
        var min_temp = 1000;
        var min_date = "";
        //due to a bug in the second weather station, we have to compare station 1 and 2 for data prior to 28th of Feb 2019
        db.get(sql, [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }

            console.log("Min temp from station 1 = " + row.min_temp);
            min_temp = row.min_temp;
            min_date = row.when_recorded;           
        });

        sql = "Select Min(temperature) as min_temp, when_recorded from temperature\
        where strftime('%Y', when_recorded) = '" + year + "' and when_recorded < '" + cutoffStr + "' and stat_id = 2";

        console.log(sql);
        db.get(sql, [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }

            if(row.min_temp < min_temp){
                min_temp = row.min_temp;
                min_date = row.when_recorded;     
            }

            console.log("Min temp from station 2 = " + row.min_temp);
            response.yearly_coldest_temp = min_temp;
            var coldestDay = new Date(min_date);
            response.yearly_coldest_day = coldestDay.toLocaleString("en-US", options);
        });


        sql = "Select Max(speed) as max_speed, when_recorded from wind\
        where strftime('%Y', when_recorded) = '" + year + "'";

        db.get(sql, [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }

            response.yearly_max_wind = row.max_speed * MS_TO_KMPH;
            var windiestDay = new Date(row.when_recorded);
            response.yearly_windiest_day = windiestDay.toLocaleString("en-US", options);

            //Send the result
            let resp = JSON.stringify(response);
            sendResponse(res, resp);
        });


        db.close();
    });

};

function getDirection(windBearing) {
    if (windBearing < 0) windBearing += 360;

    if (windBearing > 292.5 && windBearing <= 337.5) {
        return directionName[7];
    } else if (windBearing > 22.5 && windBearing <= 67.5) {
        return directionName[1];
    } else if (windBearing > 67.5 && windBearing <= 112.5) {
        return directionName[2];
    } else if (windBearing > 112.5 && windBearing <= 157.5) {
        return directionName[3];
    } else if (windBearing > 157.5 && windBearing <= 202.5) {
        return directionName[4];
    } else if (windBearing > 202.5 && windBearing <= 247.5) {
        return directionName[5];
    } else if (windBearing > 247.5 && windBearing <= 292.5) {
        return directionName[6];
    } else {
        return directionName[0];
    }
}

exports.read_temp_today = function (req, res) {
    let today = new Date();
    let todayStr = today.getFullYear() + '-'
        + ('0' + (today.getMonth() + 1)).slice(-2) + '-'
        + ('0' + today.getDate()).slice(-2);


    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded > '" + todayStr +
        "' and stat_id = " + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_temp_lastweek = function (req, res) {
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-6 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_temp_lastquarter_max = function (req, res) {
    let sql = "Select MAX(temperature) as temperature, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-90 day'))\
               and stat_id=" + req.params.stationid + " GROUP BY strftime(\"%d-%m-%Y\", when_recorded) ORDER BY when_recorded";
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_temp_range = function (req, res) {
    let sql = "Select temperature, humidity, pressure, when_recorded \
               from temperature where when_recorded  > (SELECT DATETIME('now', '-" + req.query.day + " day')) \
               and stat_id=" + req.query.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_soil_lastweek = function (req, res) {
    let sql = "Select soil_moisture, soil_temperature, when_recorded \
               from soil where when_recorded  > (SELECT DATETIME('now', '-6 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_soil_lastquarter = function (req, res) {
    let sql = "Select AVG(soil_temperature) as soil_temperature, AVG(soil_moisture) as soil_moisture, when_recorded \
               from soil where when_recorded  > (SELECT DATETIME('now', '-90 day'))\
               and stat_id=" + req.params.stationid + " GROUP BY strftime(\"%d-%m-%Y\", when_recorded) ORDER BY when_recorded";
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_rain_lastweek = function (req, res) {
    let sql = "Select one_hr_rain, todays_rain, when_recorded \
               from rain where when_recorded  > (SELECT DATETIME('now', '-6 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_rain_lastquarter = function (req, res) {
    let sql = "Select SUM(one_hr_rain) as todays_rain, when_recorded \
               from rain where when_recorded  > (SELECT DATETIME('now', '-90 day'))\
               and stat_id=" + req.params.stationid + " GROUP BY strftime(\"%d-%m-%Y\", when_recorded) ORDER BY when_recorded";

    excecuteAndSendJSONResponse(sql, res);
};

exports.read_wind_lastweek = function (req, res) {
    let sql = "Select bearing, speed, max_speed, when_recorded \
               from wind where when_recorded  > (SELECT DATETIME('now', '-6 day'))\
               and stat_id=" + req.params.stationid;
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_wind_lastquarter = function (req, res) {
    let sql = "Select MAX(max_speed) as max_speed, when_recorded \
               from wind where when_recorded  > (SELECT DATETIME('now', '-90 day'))\
               and stat_id=" + req.params.stationid + " GROUP BY strftime(\"%d-%m-%Y\", when_recorded) ORDER BY when_recorded";
    excecuteAndSendJSONResponse(sql, res);
};

exports.read_wind_direction_lastweek = function(req, res){

    var windStrengths = {};
    
    for(var i=0;i<directionName.length; i++){       
        (windStrengths[directionName[i]] = new Array(WIND_SPEED_BINS)).fill(0);    
    }

    let sql = "Select bearing, speed from wind where \
               when_recorded  > (SELECT DATETIME('now', '-6 day')) \
               and stat_id = " + req.params.stationid;
    let db = openDB();
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
       
        //bin the values
        var totalValues = 0;
        rows.forEach((row) => {
            var dir = getDirection(row.bearing);
            var speedBin = getSpeedBin(row.speed*MS_TO_KMPH);
            windStrengths[dir][speedBin] = windStrengths[dir][speedBin] + 1;
            totalValues++;
        });
                
        var allDirections = [];

        //convert bins to percentages
        for(var i=0;i<directionName.length; i++){
            for(var j=0;j<WIND_SPEED_BINS;j++){
                var percent = windStrengths[directionName[i]][j]/totalValues * 100;
                var directionRecord = {
                    direction:directionName[i],
                    bin:binName[j],
                    percentage:percent,
                }

                allDirections.push(directionRecord);
            }
        }        
        
        //Send the result
        let resp = JSON.stringify(allDirections);
        sendResponse(res, resp);
    });

    db.close();
}

function getSpeedBin(speed){
   const BIN1_MAX = 10;
   const BIN2_MAX = 20;
   const BIN3_MAX = 30;
   const BIN4_MAX = 40;
   
   var bin = 0;
   if(speed < BIN1_MAX){
       bin = 0;
   }else if(speed < BIN2_MAX){
       bin = 1;
   }else if(speed < BIN3_MAX){
       bin =2 ;
   }else if(speed < BIN4_MAX){
       bin = 3;
   }else{
       bin = 4;
   }

   return bin;
}

function excecuteAndSendJSONResponse(sql, res) {
    let jsonExporter = getJsonExporter();
    //console.log(sql);
    jsonExporter.json(sql, function (err, json) {
        if (err) {
            console.log(err);
            res.status(501).send("Error obtaining weather data");
        }
        sendResponse(res, json);
    });
}

function sendResponse(res, json) {
    res.header("Content-Type", "application/json");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.send(json);
}

function getJsonExporter() {
    let db = openDB();
    let jsonExporter = sqliteJson(db);
    return jsonExporter;
}

function openDB() {
    // open the database
    let db = new sqlite3.Database('/Users/jamesmasterman/Documents/Development/github/weatherstation/WeatherServer/weatherstation/weather.db', sqlite3.OPEN_READONLY, (err) => {
        //let db = new sqlite3.Database('/home/pi/Documents/programming/github/weatherstation/WeatherServer/weatherstation/weather.db', sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the weather database.');
    });

    return db;
}