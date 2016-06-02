# node-beauty

[![npm package](https://nodei.co/npm/node-beauty.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/node-beauty/)

> 我是来自中国的码农 Bun，该模块已被用于多个在线项目中，旨为构建基于 REST Service 的网站或 APP 提供可复用的服务端模块。
>
> -- 2016.6.1

## 易于使用

node-beauty (以下简称 Beauty) 是基于 [restify](https://www.npmjs.com/package/restify) 模块的 HTTP 服务器，提供了简单封装，但你依然可以使用并控制 restify 的路由行为。

Beauty 已提供了常用基础设施的服务模块，如 MySQL，Redis，MongoDB，Solr 等，并能灵活装拆。

```js
var server = require('node-beauty');
server.init({
  config: 'config.js',
  syspath: 'sys'
});
server.use('mysql', require('./node-beauty-mysql'));
server.use('redis', require('./node-beauty-redis'));
// server.use('some-service');
server.start();
```
## 目录

最新最详细的文档，可以到 http://beauty.hdwong.com/ 查阅。

- [安装](#install)
- [配置](#config)
- [启动](#start)
- [安装服务模块](#use-service)
- [自定义服务模块](#dev-service)

## 安装

## 配置

## 启动

## 安装服务模块

## 自定义服务模块