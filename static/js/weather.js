"use strict";
///
/// socket events
///
socket.on('weather', function (data) {
  var container = document.getElementById('weather');
  var replacement = container.cloneNode();


  if (data.length == 0) container.style.display = 'none';
  else container.style.display = '';

  data.forEach(function (i) {
    var li = document.createElement('li');
    var img = document.createElement('img');
    img.src = 'svg/' + i.icon;
    li.appendChild(img);
    var p = document.createElement('p');

    // time
    var time = new Date(i.time);
    p.textContent = time.getHours() + ':00';
    li.appendChild(p);

    // temp
    p = p.cloneNode();
    p.textContent = Math.round(i.temperature) + '°C';
    li.appendChild(p);

    // precipitation
    p = p.cloneNode();
    p.textContent = i.rainPrecipitation + 'mm';
    li.appendChild(p);

    replacement.appendChild(li);
  });

  container.parentNode.replaceChild(replacement, container);
});