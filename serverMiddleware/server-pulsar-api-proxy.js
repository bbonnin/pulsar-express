const express = require('express')
const request = require('request')

const app = express()

app.all('/*', (req, res) => {
  request({ method: req.method, url: req.query['u'] + '/' + req.params['0'] })
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
})

module.exports = {
  path: '/api',
  handler: app
}
