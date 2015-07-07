var http = require('http');
var static = require('node-static');
var io = require('socket.io');
var path = require('path');
var SonosDiscovery = require('sonos-discovery');
var SMHI = require('smhi-node');
var settings = {
  port: 8080,
  cacheDir: './cache'
}

settings = require('./config.json');

var PrecipitationCategory = [
  'NONE',
  'SNOW',
  'SNOW_MIXED_WITH_RAIN',
  'RAIN',
  'DRIZZLE',
  'FREEZING_RAIN',
  'FREEZING_DRIZZLE',
];

var currentForecast = [];

var discovery = new SonosDiscovery();
var fileServer = new static.Server(path.resolve(__dirname, 'static'));

var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
        fileServer.serve(req, res);
    }).resume();
});

var socketServer = io.listen(server);
socketServer.set('log level', 1);

socketServer.sockets.on('connection', function (socket) {
  emitSonosState();
  socket.emit('weather', currentForecast);
});

discovery.on('topology-change', function (data) {
  emitSonosState();

});

discovery.on('transport-state', function (data) {
  emitSonosState();
});

function emitSonosState() {
  var data = [];
  discovery.zones.forEach(function (zone) {
    if (zone.coordinator.state.currentState != 'PLAYING') return;

    var simpleZone = {
      roomName: zone.coordinator.roomName,
      title: zone.coordinator.state.currentTrack.title,
      artist: zone.coordinator.state.currentTrack.artist
    }

    data.push(simpleZone);
  });


  socketServer.sockets.emit('sonos-update', data);
}

// SMHI
function triggerForecastFetch() {
  var latitude = settings.latitude, 
  longitude = settings.longitude;
SMHI.getForecastForLatAndLong(latitude, longitude)
  .then(forecastHandler)
  .catch(function (err) {
    setTimeout(triggerForecastFetch, 300000);
  });
}

function forecastHandler(data) {

  // calculate forecasts
  var forecasts = data.getForecasts();
  var response = [];

  var breakpoints = [7, 11, 14, 17, 20];

  var currentHour = new Date().getHours();

  while(breakpoints[0] < currentHour) {
    breakpoints.shift();
  }

  forecasts.forEach(function (i) {
    var forecastDate = i.getValidTime();
    if (forecastDate < Date.now()) return;
    if (breakpoints.length == 0) return;

    if (forecastDate.getHours() > breakpoints[0]) {
      // first applicable forecast

      var fc = {
        time: forecastDate,
        temperature: i.getTemperature(),
        thunder: i.getThunderstormProbability(),
        cloud: i.getTotalCloudCover(),
        rainPrecipitation: i.getTotalPrecipitationIntensity(),
        snowPrecipitation: i.getSnowPrecipitationIntensity(),
        precipitationCategory: PrecipitationCategory[i.getPrecipitationCategory()]
      };

      // calculate icon
      var icon = '';
      if (fc.cloud < 1) icon += 'clear_';
      else if (fc.cloud < 5) icon += 'medium_';
      else icon += 'thick_';

      if (fc.thunder > 40) icon += 'thunder.svg';
      else icon += fc.precipitationCategory + '.svg';

      fc.icon = icon;

      response.push(fc);

      breakpoints.shift();
    }

  });

  console.log(response);

  currentForecast = response;

  socketServer.sockets.emit('weather', response);

  setTimeout(triggerForecastFetch, 300000);
}

triggerForecastFetch();

// Attach handler for socket.io

server.listen(settings.port);

console.log("http server listening on port", settings.port);
