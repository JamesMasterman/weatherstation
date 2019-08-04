'use strict';
module.exports = function(app) {
  var weatherApi = require('../controllers/weatherController');

  // weather api Routes
  //summary weather
  app.route('/api/v1/today/:stationid')
  .get(weatherApi.read_today_summary);

  //Temperature routes
  app.route('/api/v1/temperature/today/:stationid')
    .get(weatherApi.read_temp_today);

  app.route('/api/v1/temperature/lastweek/:stationid')
    .get(weatherApi.read_temp_lastweek);

  app.route('/api/v1/temperature/lastquarter/:stationid')
    .get(weatherApi.read_temp_lastquarter_max);

  app.route('/api/v1/temperature/range/')
    .get(weatherApi.read_temp_range)

  //rain routes
  app.route('/api/v1/rain/lastweek/:stationid')
    .get(weatherApi.read_rain_lastweek);

  app.route('/api/v1/rain/lastquarter/:stationid')
    .get(weatherApi.read_rain_lastquarter);

  //soil routes
  app.route('/api/v1/soil/lastweek/:stationid')
  .get(weatherApi.read_soil_lastweek);

  app.route('/api/v1/soil/lastquarter/:stationid')
  .get(weatherApi.read_soil_lastquarter);

  //wind routes
  app.route('/api/v1/wind/lastweek/:stationid')
  .get(weatherApi.read_wind_lastweek);

  app.route('/api/v1/wind/lastquarter/:stationid')
  .get(weatherApi.read_wind_lastquarter);

  //wind direction routes
  app.route('/api/v1/wind/direction/lastweek/:stationid')
  .get(weatherApi.read_wind_direction_lastweek);

  //weather stats
  app.route('/api/v1/summary/ytd')
  .get(weatherApi.read_year_to_date_summary_stats);


};