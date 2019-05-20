<template>
  <div class="dataview">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Clusters</el-breadcrumb-item>
    </el-breadcrumb>
    <loading v-if="loading" />
    <div v-else-if="clusters.length > 0">
      <el-table
        :data="clusters"
        style="width: 100%"
        :default-sort = "{prop: 'name', order: 'descending'}">
        <el-table-column
          fixed
          prop="name"
          label="Name"
          sortable
          width="100">
        </el-table-column>
        <el-table-column
          prop="brokerServiceUrl"
          label="Broker URL">
        </el-table-column>
        <el-table-column
          prop="serviceUrl"
          label="Service URL">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="120">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showTopics(scope.row)"
              type="text"
              size="small">
              Topics
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about clusters. Maybe you haven't defined any connections."
        show-icon>
      </el-alert>
    </div>
    <div class="button-bar">
      <el-button type="primary" @click="reload()">Reload</el-button>
    </div>
  </div> 
</template>

<script>
import loading from '@/components/loading'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'clusters',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      clusters: [],
      loading: false
    }
  },

  computed: mapState('connections', ['connections']),

  mounted() {
    this.reload()
  },

  methods: {
    ...mapActions('context', ['setCluster']),

    showTopics(cluster) {
      this.setCluster(cluster)
      this.$router.push({ path: '/topics' })
    },

    deleteCluster(idx) {
      this.clusters.splice(idx, 1)
      this.updateStorage()
    },

    addCluster(name, url) {
      this.clusters.push({ name, url })
      this.updateStorage()
    },

    async reload() {
      await this.$store.dispatch('connections/fetchConnections')

      this.loading = true
      const availableClusters = []

      let queries = []
      this.connections.forEach(connection => queries.push(this.$axios.$get('/api/admin/v2/clusters?' + connection.url)))

      const clusterList = await Promise.all(queries)

      for (const [idx, clusters] of clusterList.entries()) {
        for (const cluster of clusters) {
          const clusterInfos = await this.$axios.$get('/api/admin/v2/clusters/' + cluster + '?' + this.connections[idx].url)
          availableClusters.push({ name: cluster, serviceUrl: clusterInfos.serviceUrl, brokerServiceUrl: clusterInfos.brokerServiceUrl })
        }
      }

      this.clusters = availableClusters
      this.loading = false
    }
  },

  head() {
    return {
      title: 'pulsar-express - clusters'
    }
  }
}
</script>

<style scoped>

</style>
