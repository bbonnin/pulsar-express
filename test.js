#!/usr/bin/env node -r esm

const { Nuxt } = require('nuxt-start')

// Require nuxt config
const config = require('./nuxt.config.js')

// Create a new nuxt instance (config needs dev: false)
const nuxt = new Nuxt(config)

// Start nuxt.js server
nuxt.listen(3000)
