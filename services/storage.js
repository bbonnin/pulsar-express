
function storeConnections(connections) {
  const pulsar = { connections }
  localStorage.pulsar = JSON.stringify(pulsar)
}

export function removeConnection(idx) {
  const connections = getConnections()

  connections.splice(idx, 1)
  storeConnections(connections)

  return connections
}

export function addConnection(connection) {
  const connections = getConnections()

  connections.push(connection)
  storeConnections(connections)

  return connections
}

export function getConnections() {
  let pulsar = { connections: [] }

  if (localStorage.pulsar) {
      pulsar = JSON.parse(localStorage.pulsar)
  }

  return pulsar.connections || []
}

export function updateConnection(connection, idx) {
  const connections = getConnections()

  connections.splice(idx, 1, connection)
  storeConnections(connections)

  return connections
}

export default { getConnections, addConnection, removeConnection, updateConnection }
