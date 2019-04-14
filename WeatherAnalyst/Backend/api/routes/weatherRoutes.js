'use strict';
module.exports = function(app) {
  var weatherApi = require('../controllers/weatherController');

  // weather api Routes

  //Temperature routes
  app.route('/temperature/today/:stationid')
    .get(weatherApi.read_temp_today);

  app.route('/temperature/lastweek/:stationid')
    .get(weatherApi.read_temp_lastweek);

  app.route('/temperature/range/')
    .get(weatherApi.read_temp_range)

  //rain routes
  app.route('/rain/lastweek/:stationid')
    .get(weatherApi.read_temp_lastweek);

  //soil routes
  app.route('/soil/lastweek/:stationid')
  .get(weatherApi.read_soil_lastweek);

  //wind routes
  app.route('/wind/lastweek/:stationid')
  .get(weatherApi.read_wind_lastweek);

};