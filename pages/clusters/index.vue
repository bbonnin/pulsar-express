<template>
  <div class="dataview">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/overview' }">Home</el-breadcrumb-item>
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
          width="200">
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
          width="300">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showBrokers(scope.row)"
              type="primary" plain round
              size="mini">
              Brokers
            </el-button>
            <el-button
              @click.native.prevent="showTopics(scope.row)"
              type="primary" plain round
              size="mini">
              Topics
            </el-button>
            <el-button
              @click.native.prevent="showFunctions(scope.row)"
              type="primary" plain round
              size="mini">
              Functions
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about clusters. Maybe you haven't defined any connections or the brokers are unreachable."
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

    showBrokers(cluster) {
      this.setCluster(cluster)
      this.$router.push({ path: '/brokers' })
    },

    showFunctions(cluster) {
      this.setCluster(cluster)
      this.$router.push({ path: '/functions' })
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
      this.clusters = await this.$pulsar.fetchClusters(this.connections, this.$axios)
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
