<template>
  <div class="dataview">
    <div v-if="currentSink">
      
      <breadcrumb :items="breadcrumbItems" />
      
      <h3>Properties</h3>

      <propertyview :props="policies"></propertyview>
      
      <h3>Instances</h3>
      <div v-if="instances.length > 0">
        <el-table
          :data="instances"
          style="width: 100%">
          <el-table-column
            prop="instanceId"
            label="Id"
            width="100">
          </el-table-column>
          <el-table-column
            prop="status.workerId"
            label="Worker">
          </el-table-column>
          <el-table-column
            prop="status.running"
            label="Running">
            <template slot-scope="scope">
              <el-tag
                :type="scope.row.status.running ? 'success' : 'warning'"
                disable-transitions
                :title="scope.row.status.error">{{scope.row.status.running ? 'Yes' : 'No'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="status.numReadFromPulsar"
            label="Read">
          </el-table-column>
          <el-table-column
            prop="status.numWrittenToSink"
            label="Written">
          </el-table-column>
          <el-table-column
            prop="status.lastReceivedTime"
            label="Last received">
          </el-table-column>
          <el-table-column
            prop="status.numRestarts"
            label="Restarts">
          </el-table-column>
          <el-table-column
            prop="status.numSystemExceptions"
            label="System exc.">
          </el-table-column>
          <el-table-column
            prop="status.numSinkExceptions"
            label="Sink exc.">
          </el-table-column>
        </el-table>
      </div>
      <p v-else class="simple-msg">
        No instance.
      </p>
      <div class="button-bar">
        <el-button @click="reload()">Reload</el-button>
        <el-button type="success" @click="startAllInstances()">Start all instances</el-button>
        <el-button type="warning" @click="stopAllInstances()">Stop all instances</el-button>
        <el-button type="danger" @click="deleteSink()">Delete</el-button>
      </div>
    </div>
    <div v-else>
      <el-alert
        title="Oops!"
        type="error"
        description="It seems that this sink does not exist..."
        show-icon>
      </el-alert>
    </div>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatBoolean } from '@/services/utils'
import breadcrumb from '@/components/breadcrumb'
import propertyview from '@/components/property-view'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'sink',

  layout: 'dataview',

  components: {
    breadcrumb, propertyview
  },

  data() {
    return {
      policies: [],
      instances: []
    }
  },

  computed: {
    ...mapState('context', ['sink', 'sinks']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: 'Cluster ' + this.currentSink.cluster.name, },
        { path: '/sinks', label: 'Sinks' },
        { label: this.currentSink.sink }
      ]
    },

    currentSink() {
      if (this.sinks && this.sinks.length > this.sink) {
        return this.sinks[this.sink]
      }

      return null
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatBoolean,
    
    ...mapActions('context', ['setSink', 'setSinks']),
    
    stopAllInstances() {
      this.$pulsar.startStopSinkInstances('stop', this.currentSink.sink, this.currentSink.cluster, this.currentSink.ns)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Stop completed'
          })
          setTimeout(this.reload, 1000)
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Stop error: ' + err
          })
        })
    },

    startAllInstances() {
      this.$pulsar.startStopSinkInstances('start', this.currentSink.sink, this.currentSink.cluster, this.currentSink.ns)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Start completed'
          })
          setTimeout(this.reload, 1000)
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Start error: ' + err
          })
        })
    },
    
    deleteSink() {
      this.$pulsar.deleteSink(this.currentSink.sink, this.currentSink.cluster, this.currentSink.ns)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Deleted'
          })
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Delete error: ' + err
          })
        })
    },

    async reload() {
      let connections = []

      if (this.cluster) {
        connections.push(this.cluster.connection)
      }
      else {
        await this.$store.dispatch('connections/fetchConnections')
        connections = this.$store.state.connections.connections
      }

      this.clusters = await this.$pulsar.fetchClusters(connections)
      const cluster = this.clusters.find(c => c.name == this.$route.params.cluster)
      
      this.setSinks([{
        cluster: cluster,
        ns: {cluster: cluster, namespace: this.$route.params.tenant + '/' + this.$route.params.namespace},
        sink: this.$route.params.id
      }])
      this.setSink(0)
      
      const status = await this.$pulsar.fetchSinkStatus(this.currentSink.sink, cluster, this.currentSink.ns)
      this.instances = status.instances
      this.policies = await this.$pulsar.fetchSink(this.currentSink.sink, cluster, this.currentSink.ns)
    }
  },

  head() {
    return {
      title: 'pulsar-express - sink'
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 50px 0 20px;
  color: #1f2f3d;
}
</style>
