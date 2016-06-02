"use strict";
let options = {}, services = {}, server = null;
module.exports = {
  init: (o) => {
    options = o;
  },
  start: () => {
    options.config = options.config || 'etc/config.js';
    options.syspath = options.syspath || 'sys';
    server = require('./lib/core.js')(options, services);
  },
  use: (serviceName, instance) => services[serviceName] = instance || null,
  close: () => server.close()
};