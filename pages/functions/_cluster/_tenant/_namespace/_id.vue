<template>
  <div class="dataview">
    <div v-if="currentFunction">
      
      <breadcrumb :items="breadcrumbItems" />
      
      <h3>Exec</h3>
      <el-table
        :data="infos"
        style="width: 100%">
        <el-table-column
          prop="runtime"
          label="Runtime"
          width="150">
        </el-table-column>
        <el-table-column
          prop="className"
          label="Class name">
          <template slot-scope="scope">
            {{shortClassName(scope.row.className)}}
          </template>
        </el-table-column>
        <el-table-column
          prop="autoAck"
          label="Auto ack"
          :formatter="cellFormatBoolean">
        </el-table-column>
        <el-table-column
          prop="parallelism"
          label="Parallelism">
        </el-table-column>
        <el-table-column
          prop="processingGuarantees"
          label="Guarantees">
        </el-table-column>
        <el-table-column
          prop="retainOrdering"
          label="Retain ordering"
          :formatter="cellFormatBoolean">
        </el-table-column>        
      </el-table>

      <h3>Topics</h3>
      <el-table
        :data="infos"
        style="width: 100%">
        <el-table-column
          label="Input topics">
          <template slot-scope="scope">
            <span v-for="(input,key) in scope.row.inputSpecs" :key="key">
              {{getSimpleTopicName(key)}}<br/>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="output"
          label="Output topic"
          :formatter="cellFormatSimpleTopicName">
        </el-table-column>
        <el-table-column
          prop="logTopic"
          label="Log topic"
          :formatter="cellFormatSimpleTopicName">
        </el-table-column>       
      </el-table>

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
            prop="status.averageLatency"
            label="Avg latency">
          </el-table-column>
          <el-table-column
            prop="status.numReceived"
            label="Received">
          </el-table-column>
          <el-table-column
            prop="status.numRestarts"
            label="Restarts">
          </el-table-column>
          <el-table-column
            prop="status.numSuccessfullyProcessed"
            label="Success">
          </el-table-column>
          <el-table-column
            prop="status.numSystemExceptions"
            label="System exc.">
          </el-table-column>
          <el-table-column
            prop="status.numUserExceptions"
            label="User exc.">
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
      </div>
    </div>
    <div v-else>
      <el-alert
        title="Oops!"
        type="error"
        description="It seems that this function does not exist..."
        show-icon>
      </el-alert>
    </div>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatSimpleTopicName, getSimpleTopicName, cellFormatBoolean, shortClassName } from '@/services/utils'
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'function',

  layout: 'dataview',

  components: {
    breadcrumb
  },

  data() {
    return {
      instances: []
    }
  },

  computed: {
    ...mapState('context', ['function', 'functions']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: 'Cluster ' + this.currentFunction.cluster.name },
        { path: '/functions', label: 'Functions' },
        { label: this.fullname }
      ]
    },

    currentFunction() {
      if (this.functions && this.functions.length > this.function) {
        return this.functions[this.function]
      }

      return null
    },

    fullname() {
      return this.currentFunction.infos.tenant + '/' + 
        this.currentFunction.infos.namespace + '/' +
        this.currentFunction.infos.name
    },

    infos() {
      return [ this.currentFunction.infos ]
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatSimpleTopicName,
    getSimpleTopicName,
    cellFormatBoolean,
    shortClassName,
    
    ...mapActions('context', ['setFunction', 'setFunctions']),

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
      
      const fctSInfos = await this.$pulsar.fetchFunction(this.$route.params.tenant + '/' + this.$route.params.namespace + '/' + this.$route.params.id, cluster)
      
      this.setFunctions([
        {
            cluster: cluster,
            infos: fctSInfos
        }
      ])
      this.setFunction(0)
    
      const status = await this.$pulsar.fetchFunctionStatus(this.fullname, this.currentFunction.cluster)
      this.instances = status.instances
    },

    stopAllInstances() {
      this.$pulsar.startStopFctInstances('stop', this.fullname, this.currentFunction.cluster)
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
      this.$pulsar.startStopFctInstances('start', this.fullname, this.currentFunction.cluster)
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
    }
  },

  head() {
    return {
      title: 'pulsar-express - function'
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
