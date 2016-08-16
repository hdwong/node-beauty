"use strict";
let options = {}, services = {}, server = null;
module.exports = {
  init: (o) => {
    options = o;
  },
  start: (next, onMasterExit) => {
    options.config = options.config || 'etc/config.js';
    options.path = options.path || 'sys';
    server = require('./lib/core.js')(options, services, next, onMasterExit);
  },
  use: (serviceName, instance) => services[serviceName] = instance || null
};