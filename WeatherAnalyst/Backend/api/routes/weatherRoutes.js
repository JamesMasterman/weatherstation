'use strict';
module.exports = function(app) {
  var weatherApi = require('../controllers/weatherController');

  // weather api Routes

  //Temperature routes
  app.route('/api/v1/temperature/today/:stationid')
    .get(weatherApi.read_temp_today);

  app.route('/api/v1/temperature/lastweek/:stationid')
    .get(weatherApi.read_temp_lastweek);

  app.route('/api/v1/temperature/range/')
    .get(weatherApi.read_temp_range)

  //rain routes
  app.route('/api/v1/rain/lastweek/:stationid')
    .get(weatherApi.read_temp_lastweek);

  //soil routes
  app.route('/api/v1/soil/lastweek/:stationid')
  .get(weatherApi.read_soil_lastweek);

  //wind routes
  app.route('/api/v1/wind/lastweek/:stationid')
  .get(weatherApi.read_wind_lastweek);

};