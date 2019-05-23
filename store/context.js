export const state = () => ({
  topics: null,
  topic: null,
  function: null,
  functions: null,
  cluster: null
})

export const mutations = {
  setFunction(state, fct) {
    state.function = fct
  },

  setFunctions(state, functions) {
    state.functions = functions
  },

  setTopic(state, topic) {
    state.topic = topic
  },

  setTopics(state, topics) {
    state.topics = topics
  },

  setCluster(state, cluster) {
    state.cluster = cluster
  }
}

export const actions = {
  async setFunctions({ commit }, functions) {
    commit('setFunctions', functions)
  },

  async setFunction({ commit }, fct) {
    commit('setFunction', fct)
  },

  async setTopic({ commit }, topic) {
    commit('setTopic', topic)
  },

  async setTopics({ commit }, topics) {
    commit('setTopics', topics)
  },

  async setCluster({ commit }, cluster) {
    commit('setCluster', cluster)
  }
}
