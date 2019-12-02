const express = require('express')
const connections = require('./connections')

const app = express()

app.get('/connections', (req, res) => {
  res.json(connections)
})

module.exports = {
  path: '/api',
  handler: app
}
