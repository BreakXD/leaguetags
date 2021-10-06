'use strict';

var isElectronRenderer = require('is-electron-renderer');

module.exports = function (url, event) {
  if(isElectronRenderer) {
    var shell = require('shell');
    if (url && url.preventDefault) {
      event = url;
      event.preventDefault();
      shell.openExternal(event.target.href);
    } else {
      event.preventDefault();
      shell.openExternal(url);
    }
  } else {
    if (url && !url.preventDefault) {
      event.preventDefault();
      window.location.href = url;
    }
  }
};
