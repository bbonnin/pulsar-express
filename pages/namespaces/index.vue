<template>
  <div class="dataview">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/overview' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/clusters' }">{{cluster ? cluster.name : 'All clusters'}}</el-breadcrumb-item>
      <el-breadcrumb-item>Namespaces</el-breadcrumb-item>
    </el-breadcrumb>
    <loading v-if="loading" />
    <div v-else-if="namespaces.length > 0">
      <el-table
        :data="namespaces"
        style="width: 100%">
        <el-table-column
          prop="namespace"
          label="Name">
        </el-table-column>
        <el-table-column
          prop="cluster.name"
          label="Cluster">
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about namespaces. Maybe you haven't defined any connections or the brokers are unreachable."
        show-icon>
      </el-alert>
    </div>
    
    <div class="button-bar">
      <el-button @click="reload()">Reload</el-button>
    </div>
  </div>
</template>

<script>
import loading from '@/components/loading'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'namespaces',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      namespaces: [],
      loading: false
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
    async reload() {
      this.loading = true
      let connections = []

      if (this.cluster) {
        connections.push(this.cluster.connection)
      }
      else {
        await this.$store.dispatch('connections/fetchConnections')
        connections = this.$store.state.connections.connections
      }

      const clusters = await this.$pulsar.fetchClusters(connections)
      const tenants = await this.$pulsar.fetchTenants(clusters)  
      this.namespaces = await this.$pulsar.fetchNamespaces(tenants)

      this.loading = false
    }   
  },

  head() {
    return {
      title: 'pulsar-express - namespaces'
    }
  }
}
</script>
