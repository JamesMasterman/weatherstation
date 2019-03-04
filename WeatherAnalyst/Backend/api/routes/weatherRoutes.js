'use strict';
module.exports = function(app) {
  var weatherApi = require('../controllers/weatherController');

  // weather api Routes

  //Temperature routes
  app.route('/temperature/today/:stationid')
    .get(weatherApi.read_temp_today);

  /*app.route('/temperature/lastweek/:stationid')
    .get(weatherApi.read_temp_lastweek);

  app.route('/temperature/lastmonth/:stationid')
    .get(weatherApi.read_temp_lastmonth)

  app.route('/temperature/lastyear/:stationid')
    .get(weatherApi.read_temp_lastyear)

  app.route('/temperature/range/:stationid')
    .get(weatherApi.read_temp_range)*/
};