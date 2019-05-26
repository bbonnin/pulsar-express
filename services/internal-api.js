import axios from 'axios'

export async function getSharedConnections() {
  try {
    const result = await axios.get('/api/connections')
    return result.data
  }
  catch (err) {
    console.error(err)
    return []
  }
}
