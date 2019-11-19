import { getConnections, removeConnection, addConnection, updateConnection } from '@/services/storage'
import { getSharedConnections } from '@/services/internal-api'


export const state = () => ({
  connections: null,
  sharedConnections: null
})

export const mutations = {
  setConnections(state, newConnections) {
    state.connections = newConnections
  },
  setSharedConnections(state, newConnections) {
    state.sharedConnections = newConnections
  },
  addConnections(state, newConnections) {
    state.connections = state.sharedConnections ? 
      state.sharedConnections.concat(newConnections) : 
      newConnections
  }
}

export const actions = {
  async fetchConnections({ commit }) {   
    const localConnections = await getConnections() // Defined by the user, stored in the browser
    const sharedConnections = await getSharedConnections(this.$axios) // Configured on server-side, shared by all users
    commit('setSharedConnections', sharedConnections)
    commit('addConnections', localConnections)
  },

  async deleteConnection({ commit, state }, idx) {
    const localIdx = idx - (state.sharedConnections ? state.sharedConnections.length : 0)
    const connections = removeConnection(localIdx)
    commit('addConnections', connections)
  },

  async addConnection({ commit }, connection) {
    const connections = addConnection(connection)
    commit('addConnections', connections)
  },

  async updateConnection({ commit, state }, { connection, idx }) {
    const localIdx = idx - (state.sharedConnections ? state.sharedConnections.length : 0)
    const connections = updateConnection(connection, localIdx)
    commit('addConnections', connections)
  }
}
