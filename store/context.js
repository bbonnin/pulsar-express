export const state = () => ({
  topics: null,
  topic: null,
  namespace: null,
  namespaces: null,
  function: null,
  functions: null,
  cluster: null
})

export const mutations = {
  setNamespaces(state, ns) {
    state.namespaces = ns
  },

  setNamespace(state, ns) {
    state.namespace = ns
  },

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
  async setNamespaces({ commit }, ns) {
    commit('setNamespaces', ns)
  },

  async setNamespace({ commit }, ns) {
    commit('setNamespace', ns)
  },

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
