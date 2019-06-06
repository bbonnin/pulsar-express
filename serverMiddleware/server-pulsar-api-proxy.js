const express = require('express')
const request = require('request')
const connections = require('./connections')

const app = express()
app.use(express.json())

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
        'Authorization': 'Bearer ' + token
      }
    }

    if ((req.method == 'POST' || req.method == 'PUT')  && req.body && Object.keys(req.body).length > 0) {
      reqOptions.body = JSON.stringify(req.body)

      if (!reqOptions.headers) {
        reqOptions.headers = {}
      }
      reqOptions.headers['Content-Type'] = 'application/json;charset=UTF-8'
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
})

module.exports = {
  path: '/api',
  handler: app
}
