<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Brokers' } ]" />
    <loading v-if="loading" />
    <div v-else-if="brokers.length > 0">
      <el-table
        :data="brokers"
        style="width: 100%">
        <el-table-column
          prop="cluster.name"
          label="Cluster name"
          sortable>
        </el-table-column>
        <el-table-column
          prop="broker"
          label="Broker (web service address)">
        </el-table-column>
        <el-table-column
          fixed="right"
          width="200"
          label="Actions">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="checkHealth(scope.row)"
              type="primary" plain round
              size="mini">
              Health check
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about brokers. Maybe you haven't defined any connections or the brokers are unreachable."
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
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'brokers',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      brokers: [],
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
      this.brokers = await this.$pulsar.fetchBrokers(clusters)

      this.loading = false
    },

    checkHealth(brokerInfo) {
      this.$pulsar.checkBrokerHealth(brokerInfo)
        .then((resp) => {
          const type = resp === 'ok' ? 'success' : 'info'
          this.$message({
            type,
            message: 'Health check: ' + resp
          })
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Health check error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    }
  },

  head() {
    return {
      title: 'Brokers - Pulsar Express'
    }
  }
}
</script>
