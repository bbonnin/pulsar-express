<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Sinks' } ]" />
    <loading v-if="loading" />
    <div v-else-if="sinks.length > 0">
      <el-table
        :data="sinks"
        style="width: 100%"
        :default-sort = "{prop: 'status.numRunning', order: 'ascending'}">
        <el-table-column
          fixed
          label="Name"
          prop="sink"
          sortable>
          <template slot-scope="scope">
            <a :href="`/sinks/${scope.row.cluster.name}/${scope.row.ns.namespace}/${scope.row.sink}`">
              <el-button type="text" @click.native.prevent="showDetails(scope.row.id)">{{ scope.row.sink }}</el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column
          prop="status.numRunning"
          label="Running"
          sortable
          width="100">
          <template slot-scope="scope">
            <el-tag
                :type="scope.row.status.numRunning >= scope.row.status.numInstances ? 'success' : scope.row.status.numRunning <= 0 ? 'danger' : 'warning'"
                disable-transitions>
                {{scope.row.status.numRunning}}/{{scope.row.status.numInstances}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Read/Written">
          <template slot-scope="scope">
            {{scope.row.status.instances.reduce((r, d) => r + d.status.numReadFromPulsar, 0)}}/{{scope.row.status.instances.reduce((r, d) => r + d.status.numWrittenToSink, 0)}}
          </template>
        </el-table-column>
        <el-table-column
          label="Restarts">
          <template slot-scope="scope">
            {{scope.row.status.instances.reduce((r, d) => r + d.status.numRestarts, 0)}}
          </template>
        </el-table-column>
        <el-table-column
          label="Last received">
          <template slot-scope="scope">
            {{new Date(scope.row.status.instances.reduce((r, d) => Math.max(r, d.status.lastReceivedTime), 0)).toLocaleDateString('en-us', { month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"})}}
          </template>
        </el-table-column>
        <el-table-column
          prop="cluster.name"
          label="Cluster">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="200">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row.id)"
              type="primary" plain round
              size="mini">
              Details
            </el-button>
            <el-button
              @click.native.prevent="deleteSink(scope.row.id)"
              type="danger" plain round
              size="mini">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about sinks. Maybe you haven't defined any connections or the brokers are unreachable."
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
  name: 'sinks',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      sinks: [],
      createVisible: false,
      clusters: [],
      loading: false
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
    ...mapActions('context', ['setSink', 'setSinks']),

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

      this.clusters = await this.$pulsar.fetchClusters(connections)

      this.sinks = []
      let sinks = await this.$pulsar.fetchSinks(this.clusters)
      
      for(const el of sinks) {
        const sinkStatus = await this.$pulsar.fetchSinkStatus(el.sink, el.cluster, el.ns)
        this.sinks.push({ ...el, 
            id: this.sinks.length,
            status: sinkStatus
        })
      }
      this.setSinks(this.sinks)

      this.loading = false
    },

    showDetails(id) {
      this.setSink(id)
      const sink = this.sinks[id]
      this.$router.push({ path: '/sinks/' + sink.cluster.name + '/' + sink.ns.namespace + '/' + sink.sink })
    },
    
    deleteSink(id) {
      const sink = this.sinks[id]
      this.$pulsar.deleteSink(sink.sink, sink.cluster, sink.ns)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Deleted'
          })
          this.reload()
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Delete error: ' + err
          })
        })
    }
  },

  head() {
    return {
      title: 'pulsar-express - sinks'
    }
  }
}
</script>
