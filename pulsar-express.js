#!/usr/bin/env node

require('esm')

require('dotenv').config()

const consola = require('consola')

const port = process.env.PORT || 3000
const host = process.env.HOST || 'localhost'

// Force parameters
process.argv = process.argv.slice(0, 2).concat([
  'start', 
  '-c', __dirname + '/nuxt.config.js',
  '-p', port
])

const pkg = require(__dirname + '/package.json')
const title = ' PULSAR EXPRESS (v' + pkg.version + ') '

console.log()
console.log('\t╭' + '─'.repeat(title.length) + '╮')
console.log('\t│' + title + '│')
console.log('\t╰' + '─'.repeat(title.length) + '╯')
console.log()

consola.wrapAll()
consola.pauseLogs()

require('@nuxt/cli')
  .run()
  .then(() => {
    consola.restoreAll()
    console.log('\t=> Open http://' + host + ':' + port)
    console.log()
  })
  .catch((error) => {
    consola.resumeLogs()
    consola.fatal(error)
    process.exit(2)
  })
