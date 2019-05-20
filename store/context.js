export const state = () => ({
  topics: null,
  topic: null,
  cluster: null
})

export const mutations = {
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