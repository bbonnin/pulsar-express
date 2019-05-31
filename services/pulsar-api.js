function getServiceParams(connection) {
  let params = 'n=' + connection.name

  if (!connection.serverConfig) {
    params = 'u=' + connection.url

    if (connection.token) {
      params += '&t=' + connection.token
    }
  }

  return params
}

export default $axios => ({
  startStopFctInstances(action, fullname, cluster) {
    const url = '/api/admin/v3/functions/' + fullname + '/' + action + '?' + getServiceParams(cluster.connection)
    return $axios.$post(url)
  },

  async fetchFunction(fctName, cluster) {
    return await $axios.$get('/api/admin/v3/functions/' + fctName + '?' + getServiceParams(cluster.connection))
  },

  async fetchFunctionStatus(fctName, cluster) {
    return await $axios.$get('/api/admin/v3/functions/' + fctName + '/status?' + getServiceParams(cluster.connection))
  },

  async fetchFunctions(ns, cluster) {
    return await $axios.$get('/api/admin/v3/functions/' + ns + '?' + getServiceParams(cluster.connection))
  },

  async fetchTopicStats(topic, cluster) {
    return await $axios.$get('/api/admin/v2/' + topic + '/stats?' + getServiceParams(cluster.connection))
  },

  async fetchBrokers(clusters) {
    let brokers = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/brokers/' + cluster.name + '?' + getServiceParams(cluster.connection))
        brokers = brokers.concat(result.map(broker => ({cluster, broker})))
      }
      catch (err) {
        console.error(err)
      }
    }

    return brokers
  },

  async fetchTenantsConfig(clusters) {
    const tenants = await this.fetchTenants(clusters)

    let tenantConfigs = []

    for (const tenant of tenants) {
      try {
        const cfg = await $axios.$get('/api/admin/v2/tenants/' + tenant.tenant + '?' + getServiceParams(tenant.cluster.connection))
        tenantConfigs = tenantConfigs.concat({cluster: tenant.cluster, name: tenant.tenant, config: cfg})
      }
      catch (err) {
        console.error(err)
      }
    }

    return tenantConfigs
  },

  async fetchTenants(clusters) {
    let tenants = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/tenants?' + getServiceParams(cluster.connection))
        tenants = tenants.concat(result.map(tenant => ({cluster, tenant})))
      }
      catch (err) {
        console.error(err)
      }
    }

    return tenants
  },

  deleteTenant(tenantName, cluster) {
    return $axios.$delete('/api/admin/v2/tenants/' + tenantName + '?' + getServiceParams(cluster.connection))
  },

  createTenant(tenantName, cluster) {
    return $axios.$put('/api/admin/v2/tenants/' + tenantName + '?' + getServiceParams(cluster.connection), 
      { adminRoles: [], allowedClusters: [ cluster.name ] })
  },

  async fetchNamespaces(tenants) {
    let namespaces = []

    for (const tenant of tenants) {
      try {
        const result = await $axios.$get('/api/admin/v2/namespaces/' + tenant.tenant + '?' + getServiceParams(tenant.cluster.connection))
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
        const result = await $axios.$get('/api/admin/v2/namespaces/' + ns.namespace + '/topics?' + getServiceParams(ns.cluster.connection))
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

  deleteTopic(topicName, cluster) {
    return $axios.$delete('/api/admin/v2/' + topicName + '?' + getServiceParams(cluster.connection))
  },

  createTopic(topicName, cluster) {
    return $axios.$put('/api/admin/v2/' + topicName + '?' + getServiceParams(cluster.connection))
  },

  async fetchBrokers(clusters) {
    let brokers = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/brokers/' + cluster.name + '?' + getServiceParams(cluster.connection))
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
    connections.forEach(connection => queries.push($axios.$get('/api/admin/v2/clusters?' + getServiceParams(connection))))

    let clustersByConnection = []

    try {
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
          const clusterInfos = await $axios.$get('/api/admin/v2/clusters/' + cluster + '?' + getServiceParams(connections[idx]))
          availableClusters.push({ 
            name: cluster, 
            serviceUrl: clusterInfos.serviceUrl, 
            brokerServiceUrl: clusterInfos.brokerServiceUrl,
            connection: connections[idx] })
        }
        catch (err) {
          console.error(err)
        }
      }
    }

    return availableClusters
  }
})
