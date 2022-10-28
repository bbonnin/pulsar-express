const express = require('express')
const request = require('request')
const connections = require('./connections')
const fs = require('fs')
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express()
/*app.use(express.json())

app.all('/*', (req, res) => {
  let url = null
  let token = null
  let noConnectionMsg = null

  if (req.query['u']) {
    // Remote URL provided by the client
    url = req.query['u'] + '/' + req.params['0']
    token = req.query['t']
  }
  else if (req.query['n']) {
    // The client has only provided a name, so get the url from the configuration
    const foundConnection = connections.filter(conn => conn.name == req.query['n'])
    
    if (foundConnection.length > 0) {
      if (req.query['e'] == 'fct') {
        url = foundConnection[0].fctWorkerUrl + '/' + req.params['0']
      }
      else {
        url = foundConnection[0].url + '/' + req.params['0']
      }

      token = foundConnection[0].token
      
      query = Object.keys(req.query).filter(el => !['u', 'n', 't', 'e'].includes(el)).map(k => k + '=' + req.query[k]).join('&')
      if (query) {
        url += '?' + query
      }
    }
    else {
      noConnectionMsg = 'no connection named "' + req.query['n'] + '"'
    }
  }
  else {
    noConnectionMsg = 'missing query parameter'
  }

  if (!url) {
    res.status(400).send('Unable to connect. Reason: ' + noConnectionMsg)
  }
  else {
    const reqOptions = { method: req.method, url }

    if (token) {
      reqOptions.headers = {
        // Adding a trim because tokens from k8s secrets
        // can have trailing newlines
        'Authorization': 'Bearer ' + token.trim()
      }
    }
    
    console.log(req);
    if ((req.method == 'POST' || req.method == 'PUT')  && req.body && Object.keys(req.body).length > 0) {
      reqOptions.body = JSON.stringify(req.body)

      if (!reqOptions.headers) {
        reqOptions.headers = {}
      }
      reqOptions.headers['Content-Type'] = 'application/json;charset=UTF-8'
    }

    reqOptions.checkServerIdentity = (servername, cert) => {
          // skip certificate hostname validation
          // since inside k8s cluster it won't match
          // if proxy is exposed on a public DNS name
          return undefined;
      }

    // Adding header to all requests since function worker returns 500
    // without it on some endpoints
    if (!reqOptions.headers) {
      reqOptions.headers = {}
    }

    reqOptions.headers['Accept'] = 'application/json'

    // CA is for self signed cert; it's optional
    if (ca) {
      reqOptions.ca = ca
    }

    // cert and key are both required to enable mutual TLS
    // These are optional
    if (cert && key) {
      reqOptions.cert = cert
      reqOptions.key = key
    }

    request(reqOptions)
      .on('error', function(err) {
        console.error(err)
        let code = 500
        if (err.message.indexOf('ECONNREFUSED') > -1) {
          code = 504
        }
        else if (err.message.indexOf('ENOTFOUND') > -1) {
          code = 502
        }
        // Other errors ?
        res.status(code).send('Proxy error: ' + err.message)
      })
      .pipe(res)
    }
})*/

app.all(
  '/*',
  createProxyMiddleware({
    secure: false, // don't verify upstream ssl
    router: function(req) {
      if (req.query['u']) {
        // Remote URL provided by the client
        return req.query['u'];
      }
      else if (req.query['n']) {
        const foundConnection = connections.filter(conn => conn.name == req.query['n'])
        
        if (foundConnection.length > 0) {
          if (req.query['e'] == 'fct') {
            return foundConnection[0].fctWorkerUrl;
          }
          else {
            return foundConnection[0].url;
          }
        }
      }
    },
    pathRewrite: function(path, req) {
      console.log(req.params);
      let ret = req.params['0'];
      
      if (req.query['n']) {
        //Reserve client query because some APIs need them
        query = Object.keys(req.query).filter(el => !['u', 'n', 't', 'e'].includes(el)).map(k => k + '=' + req.query[k]).join('&')
        if (query) {
          ret += '?' + query;
        }
      }
      
      return ret;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        let token = null;
        if (req.query['u']) {
          // Remote URL provided by the client
          token = req.query['t']
        }
        else if (req.query['n']) {
          // The client has only provided a name, so get the url from the configuration
          const foundConnection = connections.filter(conn => conn.name == req.query['n'])
          
          if (foundConnection.length > 0) {
            token = foundConnection[0].token
          }
        }
        
        if (token) {
          // Adding a trim because tokens from k8s secrets
          // can have trailing newlines
          proxyReq.setHeader('Authorization', 'Bearer ' + token.trim());
        }
      }
    }
  })
);


module.exports = {
  path: '/api',
  handler: app
}
