# node-beauty

[![npm package](https://nodei.co/npm/node-beauty.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-beauty/)

> 我是来自中国的码农 Bun，该模块已被用于多个在线项目中，旨为构建基于 REST Service 的网站或应用提供可复用的服务端模块。
>
> -- 2016.6.1

## 易于使用

node-beauty (以下简称 Beauty) 是基于 [restify](https://www.npmjs.com/package/restify) 模块的 HTTP 服务器，进行了封装，但你依然可以获得并控制 restify 的路由行为。

Beauty 已提供了常用基础设施的服务模块，如 MySQL，Redis，MongoDB，Solr 等，并能灵活装拆。

```js
// app.js
var server = require('node-beauty');
server.init({
  config: 'config.js',
  path: 'sys'
});
server.use('mysql', require('node-beauty-mysql'));
server.use('redis', require('node-beauty-redis'));
// server.use('some-service');
server.use('test', {
  get_default: (req, res, next) => next('Hello world')
});
server.start();
```

## 目录

- [安装](#install)
- [配置](#configure)
- [启动](#start)
- [安装服务模块](#use-module)
- [使用](#access)
- [自定义服务模块](#custom-module)
- [客户端 SDK](#client-sdk)
  - [PHP](#php)
  - [Node.js](#nodejs)

<h2 name="install">安装</h2>

    $ npm install node-beauty

<h2 name="configure">配置</h2>

Beauty 需要准备一个配置文件，并返回一个配置对象，例子：

```js
// config.js
module.exports = {
  app: {
    daemonize: false
  },
  server: {
    host: '127.0.0.1',
    token: 'this is a secure token'
  },
  service: {
    mysql: {
      master: {
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '',
        database: 'test',
        charset: 'utf8'
      }
    }
  }
};
```
配置文件分为三部分，app 设置应用程序的运行选项；server 设置 restify 服务器的侦听端口及访问限制选项；service 设置各个服务模块的选项。

### config.app

- `daemonize` - 是否开启后台运行模式，默认 `false`
- `worker_processes` - 子进程数量，默认为 cpu 内核数
- `pid` - PID 文件目录，默认为程序当前目录
- `log4js` - 是否使用 [log4js](https://www.npmjs.com/package/log4js) 日志模块，如果使用，此选项传入 log4js 模块的 JSON 配置文件路径，默认为程序当前目录下的 /log4js.json；传入 `false` 则使用控制台 `console.log` 作为日志输出

### config.server

- `name` - 服务器名称，默认 "Beauty Restful API Server"
- `version` - 服务版本，默认 "1.0.0"
- `token` - 服务请求时 `request.headers.token` 需带上相符的 token 字符串，该选项必须设置，必须为字符串且不能为空串 ""
- `ip_list` - 白名单 IP 数组，客户请求的来源 IP 必须在列表内，若该数组为空时不作来源 IP 检查，默认为空数组 `[]`，

### config.service

服务模块的选项依赖你安装了哪些服务模块，该选项列表的键为服务模块的名称，值为该服务模块的配置对象，格式为：

```
[服务模块名称]: {
  选项1: xxx,
  选项2: xxx,
  ...
},
mysql: {
  ...
},
redis: {
  ...
},
"your-own-service": {
  ...
}
```

<h2 name="start">启动</h2>

启动 Beauty 需三个步骤

### 初始化

```js
// app.js
var server = require('node-beauty');
server.init({
  config: 'config.js',
  path: 'sys'
});
```

`server.init` 方法接受 `options` 作为参数

- `config` - 配置文件路径，默认为程序当前目录下的 /config.js
- `path` - 自定义服务模块的加载路径，默认为程序当前目录下的 /sys 目录

### 安装服务模块

`server.use` 方法详见 [安装服务模块](#安装服务模块)

### 开启 restify 服务器

```js
// app.js
server.start((server) => {
  // do something
});
```

`server.start` 方法接受一个回调函数，返回启动后的 restify 服务器实例，以实现对 restify 的控制

<h2 name="use-module">安装服务模块</h2>

Beauty 通过 `server.use` 来安装服务模块，原型：

```
server.use( [服务模块名称], [服务对象] );
```

Beauty 提供三种服务模块的安装方式

### node-beauty-* 模块

Beauty 提供了一些常用的基础服务模块，做好配置后加载即能使用

- [node-beauty-mysql](https://www.npmjs.com/package/node-beauty-mysql) - MySQL 数据库服务模块
- [node-beauty-redis](https://www.npmjs.com/package/node-beauty-redis) - Redis 缓存服务模块
- [node-beauty-mongodb](https://www.npmjs.com/package/node-beauty-mongodb) - MongoDB 对象存储服务模块
- [node-beauty-email](https://www.npmjs.com/package/node-beauty-email) - Email 电子邮件发送服务模块
- [node-beauty-upyun](https://www.npmjs.com/package/node-beauty-upyun) - UPYun 存储服务模块，服务提供商见 https://www.upyun.com/
- [node-beauty-qiniu](https://www.npmjs.com/package/node-beauty-qiniu) - Qiniu 存储服务模块，服务提供商见 http://www.qiniu.com/
- [node-beauty-solr](https://www.npmjs.com/package/node-beauty-solr) - Solr 全文检索服务模块
- [node-beauty-location](https://www.npmjs.com/package/node-beauty-location) - Location GEO-IP 地理信息查询服务模块

```js
// app.js
server.use('db', require('node-beauty-mysql'));
```

### 文件加载

当服务对象参数为空时，Beauty 会自动查找 `options.path` 服务模块目录下是否存在与模块名称同名的 js 文件并加载

```js
// app.js
server.use('your-own-service');
```

上述例子中，Beauty 会查找 /sys/your-own-service.js 并加载，若失败则提示异常

自定义服务模块的开发详见 [自定义服务模块](#自定义服务模块)

### 内联对象

```js
// app.js
server.use('test', {
  get_default: (req, res, next) => next('Hello world')
});
```

<h2 name="access">使用</h2>

客户端可通过 `config.server` 中设置的主机和端口号访问 API，并设置好相符的 `request.headers.token` 即可，

服务接口路径为 `http://[hostname]:[port]/[服务模块名称]/[服务方法]`

    $ curl --header token:abcd1234 --get http://127.0.0.1:1108/test
    
    {"code":1,"result":"Hello world"}

推荐使用 [Postman](https://www.getpostman.com/) 进行服务接口调试

![Postman](http://www.hdwong.com/wp-content/uploads/2016/06/postman.jpg)

### 返回值

`response.statusCode` 反映当前接口的响应状态，该状态符合 HTTP 约定，则 200 为成功，否则为失败

返回值为 JSON 格式的对象，且总会包含 `code`，也可代表不同响应状态
- `1` - 成功
- `0` - 服务模块异常
- `-1` - 服务器异常

成功时，`result` 会返回结果

失败时，`message` 会返回错误信息

<h2 name="custom-module">自定义服务模块</h2>

详细 API 文档请查阅 http://www.hdwong.com/node-beauty

<h2 name="client-sdk">客户端 SDK</h2>

<h3 name="php">PHP</h3>

PHP 客户端 SDK 请查阅 [php-azalea](https://www.npmjs.com/package/php-azalea)

<h3 name="nodejs">Node.js</h3>

Node.js 客户端 SDK 请查阅 [node-azalea](https://www.npmjs.com/package/node-azalea)


## 作者信息
* Name: Bun Wong
* Email: bunwong@qq.com
* Blog: http://www.hdwong.com/
