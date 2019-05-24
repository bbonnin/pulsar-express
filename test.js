#!/usr/bin/env node -r esm

const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)

// Import and Set Nuxt.js options
let config = require(__dirname + '/nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

console.log(config)

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()

/*
const { Nuxt } = require('nuxt-start')
 
// Require nuxt config
const config = require('./nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

 
// Create a new nuxt instance (config needs dev: false)
const nuxt = new Nuxt(config)
 
// Start nuxt.js server
nuxt.listen(3000)
*/