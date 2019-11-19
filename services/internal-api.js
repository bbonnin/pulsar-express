export async function getSharedConnections(axios) {
  try {
    const result = await axios.get('/api/connections')
    return result.data
  }
  catch (err) {
    console.error(err)
    return []
  }
}
