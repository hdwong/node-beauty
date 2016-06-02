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

最新最详细的文档，可以到 http://beauty.hdwong.com/ 查阅。

- [安装](#安装)
- [配置](#配置)
  - [config.app](#configapp)
  - [config.server](#configserver)
  - [config.service](#configservice)
- [启动](#启动)
- [安装服务模块](#安装服务模块)
- [自定义服务模块](#自定义服务模块)

## 安装

    $ npm install node-beauty

## 配置

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
- `log4js` - 是否使用 [log4js](https://www.npmjs.com/package/log4js) 日志模块，如果使用，此选项传入 log4js 模块的 JSON 配置文件路径，默认为程序当前目录下的 log4js.json；传入 `false` 则使用控制台 `console.log` 作为日志输出

### config.server

- `name` - 服务器名称，默认 "Beauty Restful API Server"
- `version` - 服务版本，默认 "1.0.0"
- `token` - 服务请求时 `req.headers` 需带上相符的 token 字符串，该选项必须设置，必须为字符串且不能为空串 ""
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

## 启动

## 安装服务模块

## 自定义服务模块

## 作者信息
* Name: Bun Wong
* Email: bunwong@qq.com

