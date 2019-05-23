<template>
  <div class="dataview">
    <div v-if="currentFunction" v-loading="loading">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/overview' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/clusters' }">{{currentFunction.cluster.name}}</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/functions' }">Functions</el-breadcrumb-item>
        <el-breadcrumb-item>{{ fullname }}</el-breadcrumb-item>
      </el-breadcrumb>
      <!--loading v-if="loading" /-->
      
      <h3>Exec</h3>
      <el-table
        :data="infos"
        style="width: 100%">
        <el-table-column
          prop="runtime"
          label="Runtime">
        </el-table-column>
        <el-table-column
          prop="className"
          label="Class name">
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
                disable-transitions>{{scope.row.status.running ? 'Yes' : 'No'}}</el-tag>
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
import { cellFormatFloat, cellFormatSimpleTopicName, getSimpleTopicName, cellFormatBoolean } from '@/services/utils'
import loading from '@/components/loading'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'function',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      loading: false,
      instances: []
    }
  },

  computed: {
    ...mapState('context', ['function', 'functions']),

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

    async reload() {
      const url = '/api/admin/v3/functions/' + this.fullname + '/status?' + this.currentFunction.cluster.serviceUrl
      const status = await this.$axios.$get(url)
      this.instances = status.instances
      console.log(status)
    },

    stopAllInstances() {
      const url = '/api/admin/v3/functions/' + this.fullname + '/stop?' + this.currentFunction.cluster.serviceUrl
      this.$axios.$post(url)
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
      const url = '/api/admin/v3/functions/' + this.fullname + '/start?' + this.currentFunction.cluster.serviceUrl
      this.$axios.$post(url)
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
