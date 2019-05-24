import express from 'express'
import request from 'request'

const app = express()

app.all('/*', (req, res) => {
  request({ method: req.method, url: req.query['u'] + '/' + req.params['0'] }).pipe(res)
})

export default {
  path: '/api',
  handler: app
}
