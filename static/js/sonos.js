"use strict";
///
/// socket events
///
socket.on('sonos-update', function (data) {
  var container = document.getElementById('rooms');
  var replacement = container.cloneNode();

  data.forEach(function (i) {
    var li = document.createElement('li');
    li.textContent = i.title + ' - ' + i.artist;
    replacement.appendChild(li);
  });

  container.parentNode.replaceChild(replacement, container);
});