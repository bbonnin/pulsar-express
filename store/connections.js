import { getConnections, removeConnection, addConnection } from '@/services/storage'

export const state = () => ({
  connections: null
})

export const mutations = {
  setConnections(state, newConnections) {
    state.connections = newConnections
  }
}

export const actions = {
  async fetchConnections({ commit }) {    
    const connections = await getConnections()
    commit('setConnections', connections)
  },

  async deleteConnection({ commit }, idx) {
    const connections = removeConnection(idx)
    commit('setConnections', connections)
  },

  async addConnection({ commit }, connection) {
    const connections = addConnection(connection)
    commit('setConnections', connections)
  }
}
