
export default $axios => ({
  startStopFctInstances(action, fullname, serviceUrl) {
    const url = '/api/admin/v3/functions/' + fullname + '/' + action + '?u=' + serviceUrl
    return $axios.$post(url)
  },

  async fetchFunction(fctName, serviceUrl) {
    return await $axios.$get('/api/admin/v3/functions/' + fctName + '?u=' + serviceUrl)
  },

  async fetchFunctionStatus(fctName, serviceUrl) {
    return await $axios.$get('/api/admin/v3/functions/' + fctName + '/status?u=' + serviceUrl)
  },

  async fetchFunctions(ns, serviceUrl) {
    return await $axios.$get('/api/admin/v3/functions/' + ns + '?u=' + serviceUrl)
  },

  async fetchTopicStats(topic, serviceUrl) {
    return await $axios.$get('/api/admin/v2/' + topic + '/stats?u=' + serviceUrl)
  },

  async fetchBrokers(clusters) {
    let brokers = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/brokers/' + cluster.name + '?u=' + cluster.serviceUrl)
        brokers = brokers.concat(result.map(broker => ({cluster, broker})))
      }
      catch (err) {
        console.error(err)
      }
    }

    return brokers
  },

  async fetchTenants(clusters) {
    let tenants = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/tenants?u=' + cluster.serviceUrl)
        tenants = tenants.concat(result.map(tenant => ({cluster, tenant})))
      }
      catch (err) {
        console.error(err)
      }
    }

    return tenants
  },

  async fetchNamespaces(tenants) {
    let namespaces = []

    for (const tenant of tenants) {
      try {
        const result = await $axios.$get('/api/admin/v2/namespaces/' + tenant.tenant + '?u=' + tenant.cluster.serviceUrl)
        namespaces = namespaces.concat(result.map(namespace => ({cluster: tenant.cluster, namespace})))
      }
      catch (err) {
        console.error(err)
      }
    }

    return namespaces
  },

  async fetchTopicsNS(namespaces) {
    let topics = []

    for (const ns of namespaces) {
      try {
        const result = await $axios.$get('/api/admin/v2/namespaces/' + ns.namespace + '/topics?u=' + ns.cluster.serviceUrl)
        topics = topics.concat(result.map(topic => ({cluster: ns.cluster, topic})))
      }
      catch (err) {
        console.error(err)
      }
    }

    return topics
  },

  async fetchTopics(clusters) {
    const tenants = await this.fetchTenants(clusters)  
    const namespaces = await this.fetchNamespaces(tenants)
    return await this.fetchTopicsNS(namespaces)
  },

  deleteTopic(fullname, serviceUrl) {
    return $axios.$delete('/api/admin/v2/' + fullname + '?u=' + serviceUrl)
  },

  createTopic(fullname, serviceUrl) {
    return $axios.$put('/api/admin/v2/' + fullname + '?u=' + serviceUrl)
  },

  async fetchBrokers(clusters) {
    let brokers = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/brokers/' + cluster.name + '?u=' + cluster.serviceUrl)
        brokers = brokers.concat(result.map(broker => ({cluster, broker})))
      }
      catch (err) {
        console.error(err)
      }
    }

    return brokers
  },

  async fetchClusters(connections) {
    const queries = []
    connections.forEach(connection => queries.push($axios.$get('/api/admin/v2/clusters?u=' + connection.url)))

    let clustersByConnection = []

    try {
      //clustersByConnection = await Promise.all(queries)
      clustersByConnection = await Promise.all(
        queries.map(p => p.catch((err) => { console.error(err); return [] })))
    }
    catch (err) {
      console.error(err)
    }

    const availableClusters = []
    for (const [idx, clusters] of clustersByConnection.entries()) {
      for (const cluster of clusters) {
        try {
          const clusterInfos = await $axios.$get('/api/admin/v2/clusters/' + cluster + '?u=' + connections[idx].url)
          availableClusters.push({ name: cluster, serviceUrl: clusterInfos.serviceUrl, brokerServiceUrl: clusterInfos.brokerServiceUrl })
        }
        catch (err) {
          console.error(err)
        }
      }
    }

    return availableClusters
  }
})
