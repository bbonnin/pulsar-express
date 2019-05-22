<template>
  <div class="dataview">
    <div v-if="currentFunction" v-loading="loading">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
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
            label="Running"
            :formatter="cellFormatBoolean">
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
            label="estarts">
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
  name: 'topic',

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
      const url = '/api/admin/v3/functions/' + this.fullname + '/status?' + this.currentFunction.connection
      const status = await this.$axios.$get(url)
      this.instances = status.instances
      console.log(status)
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
