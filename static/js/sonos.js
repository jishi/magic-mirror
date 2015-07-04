"use strict";
///
/// socket events
///
socket.on('sonos-update', function (data) {
  var container = document.getElementById('rooms');
  var replacement = container.cloneNode();


  if (data.length == 0) container.parentNode.style.display = 'none';
  else container.parentNode.style.display = '';

  data.forEach(function (i) {
    var li = document.createElement('li');
    li.textContent = i.title + ' - ' + i.artist;
    replacement.appendChild(li);
  });

  container.parentNode.replaceChild(replacement, container);
});