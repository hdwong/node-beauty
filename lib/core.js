"use strict";
let cluster = require('cluster'), fs = require('fs'), _ = require('lodash'),
    config = {}, rootPath = require('path').dirname(process.mainModule.filename),
    modulePath = require('path').dirname(__dirname),
    daemonize = false, isMaster = cluster.isMaster, workers = {},
    server = null, parentPid = null, logger = null;

// events
let onExit = () => {
  // close server
  if (server) {
    server.close();
  }
  setTimeout(() => {
    process.exit(1);
  }, 500);  // ensure all log has been written
};
let onError = (error, level) => {
  // log
  if (level === 'fatal') {
    console.log(error);
  } else {
    console.log(error);
  }
  onExit();
};
process.on('SIGTERM', onExit);
process.on('SIGINT', onExit);
process.on('uncaughtException', onError);

let core = {
  getRootPath: () => rootPath,
  getModulePath: () => modulePath,
  getErrorHandler: () => onError,
  getConfig: (section) => config.service[section] || {},
  getLogger: (section) => logger.getLogger(section),
  getService: (service) => server ? server.getService(service) : false,
  serviceInvoke: (service, hook, args, callback) => server ? server.serviceInvoke(service, hook, args, callback) : false,
  serviceInvokeAll: (hook, args, callback) => server ? server.serviceInvokeAll(hook, args, callback) : false,
  serviceHook: (service, hook) => server ? server.serviceHook(service, hook) : false,
  serviceImplements: (hook) => server ? server.serviceImplements(service, hook) : false,
  randomString: (len, type) => {
    let randstring = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', result = [], length, i;
    if (type !== undefined) {
      if (type == 10 || type == 16) {
        // [0-9] || [0-9a-f]
        randstring = randstring.substr(0, type);
      } else if (type == 'c') {
        // [a-zA-Z]
        randstring = randstring.substr(10);
      } else if (type == 'l') {
        // [a-z]
        randstring = randstring.substr(10, 26);
      } else if (type == 'u') {
        // [A-Z]
        randstring = randstring.substr(-26);
      } else if (type == 'ln') {
        // [0-9a-z]
        randstring = randstring.substr(0, 36);
      } else if (type == 'un') {
        // [0-9A-Z]
        randstring = randstring.substr(0, 10) + randstring.substr(-26);
      }
    }
    length = randstring.length - 1;
    for (i = 0; i < len; ++i) {
      result.push(randstring.substr(Math.floor(Math.random() * length), 1));
    }
    return result.join('');
  },
  now: () => parseInt(Date.now() / 1000, 10),
  forEach: (collection, funcRow, funcEnd) => {
    let keys = _.keys(collection), funcEach = () => {
      let key = keys.shift();
      if (key) {
        if (funcRow.length == 1) {
          funcRow(collection[key]);
          setImmediate(funcEach);
        } else if (funcRow.length == 2) {
          setImmediate(funcRow, collection[key], funcEach);
        } else {
          setImmediate(funcRow, collection[key], key, funcEach);
        }
      } else {
        setImmediate(funcEnd);
      }
    };
    funcEach();
  }
};

// start method
let start = (services, end) => {
  do {
    let argv = process.argv, op = 'start';
    if (argv.length == 3) {
      op = argv[2];
    }
    if (!_.includes([ 'start', 'stop', 'restart', 'status' ], op)) {
      console.log('Invalid op.');
      break;
    }
    daemonize = config.app.daemonize || false;
    if (isMaster) { // master
      // pid
      let pid = config.app.pid || rootPath + '/app.pid', removePid = false;
      if (op === 'stop' || op === 'restart') {
        // stop and restart
        if (!fs.existsSync(pid)) {
          console.log('Process not found.');
          break;
        } else {
          let processPid = parseInt(fs.readFileSync(pid, 'ascii'), 10);
          if (!isNaN(processPid)) {
            process.kill(processPid);
          }
        }
        if (op === 'stop') {
          break;
        } else {
          // wait pid file has been deleted
          while (fs.existsSync(pid)) {}
        }
      } else if (op === 'status') {
        // get status
        if (!fs.existsSync(pid)) {
          console.log('Process not found.');
          break;
        }
        // TODO get status
        break;
      }
      // start
      if (fs.existsSync(pid)) {
        console.log('Process has existed.');
        break;
      }
      if (daemonize) {
        // run in background
        if (process.env.__daemonize === undefined) {
          process.env.__daemonize = true;
          let child = require('child_process').spawn(argv[1], [], {
            stdio: 'ignore',
            cwd: process.cwd,
            env: process.env,
            detached: true
          });
          child.unref();
          break;
        }
      }
      fs.writeFileSync(pid, process.pid, 'ascii');
      removePid = true;
      process.on('exit', () => {
        if (removePid && fs.existsSync(pid)) {
          fs.unlinkSync(pid);
        }
      });
      let loggerApp = logger.getLogger('node-beauty');
      loggerApp.info('System started [' + process.pid + ']');
      // start workers
      let processes, childProcess;
      if (config.app.worker_processes !== undefined) {
        processes = Math.max(Math.min(parseInt(config.app.worker_processes, 10), 32), 1);
      } else {
        processes = require('os').cpus().length;
      }
      for (let i = 0; i < processes; ++i) {
        childProcess = cluster.fork({ parent_pid: process.pid, child_index: i });
        workers[childProcess.process.pid] = childProcess;
      }
      loggerApp.info('Processes count: ' + processes);
    } else {  // child
      parentPid = process.env.parent_pid || 0;
      logger.replaceConsole();
      let domain = require('domain').create();
      domain.on('error', onError);
      domain.run(() => {
        server = require(modulePath + '/lib/server.js')(core, {
          config: config.server,
          services: services
        }, end);
      });
    }
  } while (0);
};

module.exports = (options, services, end) => {
  // load and config
  config = require(rootPath + '/' + options.config);
  config.app = config.app || {};
  config.server = config.server || {};
  if (config.server.token !== undefined && (typeof config.server.token !== 'string' ||
      config.server.token === '')) {
    return onError('Access token is invalid');
  }
  let sysPath = rootPath + '/' + options.path;
  try {
    // init logger
    if (config.app.log4js === undefined || config.app.log4js) {
      logger = require('log4js');
      logger.configure(rootPath + '/' + (config.app.log4js || 'log4js.json'));
    } else {
      throw true;
    }
  } catch(e) {
    // default logger
    let formatDate = () => {
      let pad2 = (n) => n <= 9 ? ('0' + n) : n.toString();
      let pad3 = (n) => n <= 99 ? ('0' + pad2(n)) : n.toString();
      let d = new Date();
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
          pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds()) + '.' +
          pad3(d.getMilliseconds());
    };
    logger = {
      getLogger: (section) => {
        return {
          trace: (t) => console.log('[' + formatDate() + '] [TRACE] ' + section + ' -' + t),
          debug: (t) => console.log('[' + formatDate() + '] [DEBUG] ' + section + ' - ' + t),
          info: (t) => console.log('[' + formatDate() + '] [INFO] ' + section + ' - ' + t),
          warn: (t) => console.log('[' + formatDate() + '] [WARN] ' + section + ' - ' + t),
          error: (t) => console.log('[' + formatDate() + '] [ERROR] ' + section + ' - ' + t),
          fatal: (t) => console.log('[' + formatDate() + '] [FATAL] ' + section + ' - ' + t)
        };
      },
      replaceConsole: _.noop
    };
  }
  config.service = config.service || {};
  if (!isMaster) {
    _.forEach(services, (instance, serviceName) => {
      if (instance === null) {
        services[serviceName] = require(sysPath + '/' + serviceName);
      }
    });
  }
  start(services, () => {
    if (typeof end === 'function') {
      end(core, server.getServer());
    }
  });
};
