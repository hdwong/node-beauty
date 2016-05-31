"use strict";
let options = {}, services = {}, server = null;
module.exports = {
  init: (o) => {
    options = o;
  },
  start: () => {
    let config = options.config || 'etc/config.js',
        sysPath = options.syspath || 'sys';
    server = require('./lib/core.js')(config, sysPath, services);
  },
  use: (serviceName, instance) => services[serviceName] = instance || null,
  close: () => server.close()
};