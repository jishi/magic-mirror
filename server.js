var http = require('http');
var static = require('node-static');
var io = require('socket.io');
var path = require('path');
var SonosDiscovery = require('sonos-discovery');
var settings = {
  port: 8080,
  cacheDir: './cache'
}

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
    console.log(zone);
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

// Attach handler for socket.io

server.listen(settings.port);

console.log("http server listening on port", settings.port);
