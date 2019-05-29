const fs = require('fs')

// Env vars:
// - PE_CONFIG_FILE : reference to a json file with multiple connections
// - PE_CONNECTION_NAME, PE_CONNECTION_URL and other security stuff
// Both config parameters will be merged

let connections = []

if (process.env.PE_CONFIG_FILE) {
  const content = fs.readFileSync(process.env.PE_CONFIG_FILE)
  connections = JSON.parse(content).map(connection => ({ ...connection, serverConfig: true }))
}

if (process.env.PE_CONNECTION_URL) {
  const name = process.env.PE_CONNECTION_NAME ? 
    process.env.PE_CONNECTION_NAME : 
    process.env.PE_CONNECTION_URL.replace(/https?:\/\//, '')
  connections.push({ name, url: process.env.PE_CONNECTION_URL, serverConfig: true })
}

module.exports = connections
