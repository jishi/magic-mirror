"use strict";

function zpad(number, width) {
  var str = number + "";
  if (str.length >= width) return str;
  var padding = new Array(width - str.length + 1).join('0');
  return padding + str;
}

function updateClock() {
  var el = document.getElementById('clock');
  var repl = el.cloneNode();

  var date = new Date();

  repl.textContent = date.getHours() + ':' + zpad(date.getMinutes(), 2);

  el.parentNode.replaceChild(repl, el);

  setTimeout(updateClock, (60-date.getSeconds())*1000);

}

updateClock();