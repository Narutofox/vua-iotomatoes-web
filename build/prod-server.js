require('./check-versions')()

var config = require('../config')
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse(config.prod.env.NODE_ENV)
}

var opn = require('opn')
var path = require('path')
var express = require('express')
var proxyMiddleware = require('http-proxy-middleware')
var serveStatic = require('serve-static');

// default port where dev server listens for incoming traffic
var port = process.env.PORT || config.prod.port
// automatically open browser, if not set will be false
var autoOpenBrowser = !!config.prod.autoOpenBrowser
// Define HTTP proxies to your custom API backend
// https://github.com/chimurai/http-proxy-middleware
var proxyTable = config.prod.proxyTable

var app = express()

// proxy api requests
Object.keys(proxyTable).forEach(function (context) {
  var options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

// serve pure static assets
app.use(serveStatic(config.prod.assetsRoot));
console.log(config.prod.assetsRoot);

const uri = 'https://localhost:' + port
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }

  // when env is testing, don't need open it
  if (autoOpenBrowser) {
    opn(uri)
  }
})
