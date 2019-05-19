<template>
  <div class="dataview">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Clusters</el-breadcrumb-item>
    </el-breadcrumb>
    <div v-if="loading" class="loading">
      <i class="el-icon-loading"/><span class="loading-msg">Loading...</span>
    </div>
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
              @click.native.prevent="showTopics(scope.$index)"
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
import { getConnections } from '@/services/storage'

export default {
  layout: 'dataview',

  data() {
    return {
      clusters: [],
      loading: false
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    showTopics: function (idx) {
      this.$router.push({ path: '/clusters/' + idx })
    },

    deleteCluster: function (idx) {
      this.clusters.splice(idx, 1)
      this.updateStorage()
    },

    addCluster: function (name, url) {
      this.clusters.push({ name, url })
      this.updateStorage()
    },

    async reload() {
      this.loading = true
      this.clusters = []

      const connections = getConnections()
      let queries = []
      connections.forEach(connection => queries.push(this.$axios.$get('/api/admin/v2/clusters?' + connection.url)))

      const clusterList = await Promise.all(queries)

      clusterList.forEach((clusters, idx) => {
        clusters.forEach(async cluster => {
          const clusterInfos = await this.$axios.$get('/api/admin/v2/clusters/' + cluster + '?' + connections[idx].url)
          this.clusters.push({ name: cluster, serviceUrl: clusterInfos.serviceUrl, brokerServiceUrl: clusterInfos.brokerServiceUrl })
        })
      })

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
.loading {
  margin: 20px 0 20px 0;
}
.loading-msg {
  font-size: 16px;
  color: #606266;
  margin-left: 5px;
}
</style>
