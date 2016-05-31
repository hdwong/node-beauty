"use strict";
let options = {}, server = null;
module.exports = {
  init: (o) => {
    options = o;
  },
  start: () => {
    let config = options.config || 'etc/config.js',
        syspath = options.syspath || 'sys';
    server = require('./lib/core.js')(config, syspath);
  }
};