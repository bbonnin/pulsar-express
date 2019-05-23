<template>
  <div class="dataview">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/overview' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/clusters' }">{{cluster ? cluster.name : 'All clusters'}}</el-breadcrumb-item>
      <el-breadcrumb-item>Functions</el-breadcrumb-item>
    </el-breadcrumb>
    <loading v-if="loading" />
    <div v-else-if="functions.length > 0">
      <el-table
        :data="functions"
        style="width: 100%"
        height_="800"
        :default-sort = "{prop: 'name', order: 'ascending'}">
        <el-table-column
          fixed
          label="Name"
          sortable
          width="200">
          <template slot-scope="scope">
            {{scope.row.infos.tenant}}/{{scope.row.infos.namespace}}/{{scope.row.infos.name}}
          </template>
        </el-table-column>
        <el-table-column
          prop="infos.runtime"
          label="Runtime">
        </el-table-column>
        <el-table-column
          prop="infos.className"
          label="Class name">
        </el-table-column>
        <el-table-column
          label="Input topics">
          <template slot-scope="scope">
            <span v-for="(input,key) in scope.row.infos.inputSpecs" :key="key">
              {{getSimpleTopicName(key)}}<br/>
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="infos.output"
          label="Output topic"
          :formatter="cellFormatSimpleTopicName">
        </el-table-column>
        <el-table-column
          prop="infos.logTopic"
          label="Log topic"
          :formatter="cellFormatSimpleTopicName">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="120">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row.id)"
              type="primary" plain round
              size="mini">
              Details
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about functions. Maybe you haven't defined any connections or the brokers are unreachable."
        show-icon>
      </el-alert>
    </div>
    <div class="button-bar">
      <el-button @click="reload()">Reload</el-button>
    </div>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatSimpleTopicName, getSimpleTopicName } from '@/services/utils'
import loading from '@/components/loading'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'functions',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      loading: false,
      functions: []
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatSimpleTopicName,
    getSimpleTopicName,

    ...mapActions('context', ['setFunction', 'setFunctions']),

    multiTopic(row, column, cellValue, index) {
      let topics = ''

      return ''
    },

    showDetails(id) {
      this.setFunction(id)
      this.$router.push({ path: '/functions/' + id })
    },

    async reload() {
      this.loading = true
      let connections = []

      if (this.cluster) {
        connections.push({ url: this.cluster.serviceUrl })
      }
      else {
        await this.$store.dispatch('connections/fetchConnections')
        connections = this.$store.state.connections.connections
      }

      const clusters = await this.$pulsar.fetchClusters(connections)
      const tenants = await this.$pulsar.fetchTenants(clusters)
      const namespaces = await this.$pulsar.fetchNamespaces(tenants)

      const functionsByNs = []
      
      for (const ns of namespaces) {
        try {
          const names = await this.$axios.$get('/api/admin/v3/functions/' + ns.namespace + '?' + ns.cluster.serviceUrl)

          if (names && names.length > 0) {
            functionsByNs.push({ cluster: ns.cluster, namespace: ns.namespace, names })
          }
        }
        catch (err) {
          console.error(err)
        }
      }

      this.functions = []

      for (const functions of functionsByNs) {
        for (const fctName of functions.names) {
          const url = '/api/admin/v3/functions/' + functions.namespace + '/' + fctName + '?' + functions.cluster.serviceUrl
          const fctSInfos = await this.$axios.$get(url)
          this.functions.push({
            id: this.functions.length,
            cluster: functions.cluster,
            infos: fctSInfos })
        }
      }

      this.setFunctions(this.functions)

      this.loading = false
    }
  },

  head() {
    return {
      title: 'pulsar-express - functions'
    }
  }
}
</script>
