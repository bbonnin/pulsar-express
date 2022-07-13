function getServiceParams(connection, isFunctionApi) {
  let params = 'n=' + connection.name + (isFunctionApi ? '&e=fct' : '')

  if (!connection.serverConfig) {
    if (isFunctionApi && connection.fctWorkerUrl) {
      params = 'u=' + connection.fctWorkerUrl
    }
    else {
      params = 'u=' + connection.url
    }

    if (connection.token) {
      params += '&t=' + connection.token
    }
  }

  return params
}

export default $axios => ({
  startStopFctInstances(action, fullname, cluster) {
    const url = '/api/admin/v3/functions/' + fullname + '/' + action + '?' + getServiceParams(cluster.connection, true)
    return $axios.$post(url)
  },

  async fetchFunction(fctName, cluster) {
    return await $axios.$get('/api/admin/v3/functions/' + fctName + '?' + getServiceParams(cluster.connection, true))
  },

  async fetchFunctionStatus(fctName, cluster) {
    return await $axios.$get('/api/admin/v3/functions/' + fctName + '/status?' + getServiceParams(cluster.connection, true))
  },

  async fetchFunctions(ns, cluster) {
    // Using v2 API here because this endpoint is missing from V3 on function worker
    return await $axios.$get('/api/admin/v2/functions/' + ns + '?' + getServiceParams(cluster.connection, true))
  },

  async fetchTopicStats(topic, cluster) {
    return await $axios.$get('/api/admin/v2/' + topic + '/stats?' + getServiceParams(cluster.connection))
  },
  
  async deleteFunction(fctName, cluster) {
    return await $axios.$delete('/api/admin/v3/functions/' + fctName + '?' + getServiceParams(cluster.connection, true))
  },

  async fetchNamespace(ns, cluster) {
    return await $axios.$get('/api/admin/v2/namespaces/' + ns + '?' + getServiceParams(cluster.connection))
  },

  async fetchBrokers(clusters) {
    let brokers = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/brokers/' + cluster.name + '?' + getServiceParams(cluster.connection))
        brokers = brokers.concat(result.map(broker => ({ cluster, broker })))
      }
      catch (err) {
        console.error(err)
      }
    }

    return brokers
  },

  checkBrokerHealth(brokerInfo) {

    const brokerUrl = brokerInfo.broker
    const token = brokerInfo.cluster.connection.token

    let params = 'u=http://' + brokerUrl
    if (token) {
      params += '&t=' + token
    }

    return $axios.$get('/api/admin/v2/brokers/health?' + params)
  },

  async fetchTenantsConfig(clusters) {
    const tenants = await this.fetchTenants(clusters)

    let tenantConfigs = []

    for (const tenant of tenants) {
      try {
        const cfg = await $axios.$get('/api/admin/v2/tenants/' + tenant.tenant + '?' + getServiceParams(tenant.cluster.connection))
        tenantConfigs = tenantConfigs.concat({ cluster: tenant.cluster, name: tenant.tenant, config: cfg })
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
        tenants = tenants.concat(result.map(tenant => ({ cluster, tenant })))
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
      { adminRoles: [], allowedClusters: [cluster.name] })
  },

  async fetchNamespaces(tenants) {
    let namespaces = []

    for (const tenant of tenants) {
      try {
        const result = await $axios.$get('/api/admin/v2/namespaces/' + tenant.tenant + '?' + getServiceParams(tenant.cluster.connection))
        namespaces = namespaces.concat(result.map(namespace => ({ cluster: tenant.cluster, namespace })))
      }
      catch (err) {
        console.error(err)
      }
    }

    return namespaces
  },

  createNamespace(tenantName, namespace, cluster) {
    return $axios.$put('/api/admin/v2/namespaces/' + tenantName + '/' + namespace + '?' + getServiceParams(cluster.connection))
  },

  deleteNamespace(namespace, cluster) {
    return $axios.$delete('/api/admin/v2/namespaces/' + namespace + '?' + getServiceParams(cluster.connection))
  },

  async fetchTopicsNS(namespaces) {
    let topics = []

    for (const ns of namespaces) {
      try {
        const result = await $axios.$get('/api/admin/v2/namespaces/' + ns.namespace + '/topics?' + getServiceParams(ns.cluster.connection))
        topics = topics.concat(result.map(topic => ({ cluster: ns.cluster, topic })))
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

  async fetchSinksNS(namespaces) {
    let sinks = []

    for (const ns of namespaces) {
      try {
        const result = await $axios.$get('/api/admin/v3/sinks/' + ns.namespace + '?' + getServiceParams(ns.cluster.connection, true))
        sinks = sinks.concat(result.map(sink => ({ cluster: ns.cluster, ns: ns, sink })))
      }
      catch (err) {
        console.error(err)
      }
    }
    return sinks
  },

  async fetchSinks(clusters) {
    const tenants = await this.fetchTenants(clusters)
    const namespaces = await this.fetchNamespaces(tenants)

    return await this.fetchSinksNS(namespaces)
  },

  async fetchSink(sink, cluster, ns) {
    return await $axios.$get('/api/admin/v3/sinks/' + ns.namespace + '/' + sink + '?' + getServiceParams(cluster.connection, true))
  },
  
  async fetchSinkStatus(sink, cluster, ns) {
    return await $axios.$get('/api/admin/v3/sinks/' + ns.namespace + '/' + sink + '/status?' + getServiceParams(cluster.connection, true))
  },
  
  async startStopSinkInstances(action, sink, cluster, ns) {
    return await $axios.$post('/api/admin/v3/sinks/' + ns.namespace + '/' + sink + '/' + action + '?' + getServiceParams(cluster.connection, true))
  },
  
  async deleteSink(sink, cluster, ns) {
    return await $axios.$delete('/api/admin/v3/sinks/' + ns.namespace + '/' + sink + '?' + getServiceParams(cluster.connection, true))
  },

  async fetchSourcesNS(namespaces) {
    let sources = []

    for (const ns of namespaces) {
      try {
        const result = await $axios.$get('/api/admin/v3/sources/' + ns.namespace + '?' + getServiceParams(ns.cluster.connection, true))
        sources = sources.concat(result.map(source => ({ cluster: ns.cluster,ns: ns, source })))
      }
      catch (err) {
        console.error(err)
      }
    }

    return sources
  },

  async fetchSources(clusters) {
    const tenants = await this.fetchTenants(clusters)
    const namespaces = await this.fetchNamespaces(tenants)

    return await this.fetchSourcesNS(namespaces)
  },

  async fetchSource(source, cluster, ns) {
    return await $axios.$get('/api/admin/v3/sources/' + ns.namespace + '/' + source + '?' + getServiceParams(cluster.connection, true))
  },

  deleteTopic(topicName, cluster) {
    return $axios.$delete('/api/admin/v2/' + topicName + '?' + getServiceParams(cluster.connection))
  },

  createTopic(topicName, cluster) {
    return $axios.$put('/api/admin/v2/' + topicName + '?' + getServiceParams(cluster.connection))
  },

  peekMessages(topicName, subName, count, cluster) {
    return $axios.get('/api/admin/v2/' + topicName + '/subscription/' + encodeURIComponent(encodeURIComponent(subName)) + '/position/' + count + '?' + getServiceParams(cluster.connection))
  },
  
  async getLastCommitMessages(topicName, cluster) {
    const lastCommitMessage = await $axios.$get('/api/admin/v2/' + topicName + '/lastMessageId?' + getServiceParams(cluster.connection))
    if (lastCommitMessage) {
        return {
            ...lastCommitMessage,
            payload: await $axios.$get('/api/admin/v2/' + topicName + '/ledger/' + lastCommitMessage.ledgerId + '/entry/' + lastCommitMessage.entryId + '?' + getServiceParams(cluster.connection))
        }
    }
    return null;
  },
  
  async getMessagesPublishedJustAfterTimestamp(topicName, timestamp, cluster) {
    const publishedMessage = await $axios.$get('/api/admin/v2/' + topicName + '/messageid/' + timestamp + '?' + getServiceParams(cluster.connection))
    if (publishedMessage) {
        return {
            ...publishedMessage, 
            payload: await $axios.$get('/api/admin/v2/' + topicName + '/ledger/' + publishedMessage.ledgerId + '/entry/' + publishedMessage.entryId + '?' + getServiceParams(cluster.connection))
        }
    }
    return null;
  },
  
  async resetSubscription(topicName, subName, timestamp, cluster) {
    return await $axios.$post('/api/admin/v2/' + topicName + '/subscription/' + encodeURIComponent(encodeURIComponent(subName)) + '/resetcursor/' + timestamp + '?' + getServiceParams(cluster.connection))
  },

  async fetchBrokers(clusters) {
    let brokers = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/brokers/' + cluster.name + '?' + getServiceParams(cluster.connection))
        brokers = brokers.concat(result.map(broker => ({ cluster, broker })))
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
            connection: connections[idx]
          })
        }
        catch (err) {
          console.error(err)
        }
      }
    }

    return availableClusters
  },

  updateClusterConfig(cluster) {
    return $axios.$post('/api/admin/v2/clusters/' + cluster.name + '?' + getServiceParams(cluster.connection),
      {
        serviceUrl: cluster.serviceUrl,
        serviceUrlTls: cluster.serviceUrlTls,
        brokerServiceUrl: cluster.brokerServiceUrl,
        brokerServiceUrlTls: cluster.brokerServiceUrlTls
      })
  },
  
  async fetchWorkers(clusters) {
    let workers = []

    for (const cluster of clusters) {
      try {
        const result = await $axios.$get('/api/admin/v2/worker/cluster?' + getServiceParams(cluster.connection))
        workers = workers.concat(result.map(worker => ({ cluster, worker })))
      }
      catch (err) {
        console.error(err)
      }
    }

    return workers
  },
  
  async rebalanceWorkers(cluster) {
    return await $axios.$put('/api/admin/v2/worker/rebalance?' + getServiceParams(cluster.connection))
  },
})
