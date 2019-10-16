<template>
  <div class="dataview">
    <breadcrumb :items="breadcrumbItems" />
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
            <el-button type="text" @click.native.prevent="showDetails(scope.row.id)">
              {{scope.row.infos.tenant}}/{{scope.row.infos.namespace}}/{{scope.row.infos.name}}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="infos.runtime"
          label="Runtime"
          width="100">
        </el-table-column>
        <el-table-column
          label="Class name">
          <template slot-scope="scope">
            {{shortClassName(scope.row.infos.className)}}
          </template>
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
        description="Cannot get any information about functions. Maybe you haven't defined any connections or the brokers are unreachable (or maybe it's time to drink a beer...)."
        show-icon>
      </el-alert>
    </div>
    <div class="button-bar">
      <el-button @click="reload()">Reload</el-button>
    </div>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatSimpleTopicName, getSimpleTopicName, shortClassName } from '@/services/utils'
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'functions',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      loading: false,
      functions: []
    }
  },

  computed: {
    ...mapState('context', ['cluster']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: this.cluster ? 'Cluster ' + this.cluster.name : 'All clusters'},
        { label: 'Functions' }
      ]
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatSimpleTopicName,
    getSimpleTopicName,
    shortClassName,

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
        connections.push(this.cluster.connection)
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
          const names = await this.$pulsar.fetchFunctions(ns.namespace, ns.cluster)

          if (names && names.length > 0) {
            functionsByNs.push({ cluster: ns.cluster, namespace: ns.namespace, names })
          }
        }
        catch (err) {
          console.error(err)
          /*
          this.$message({
            type: 'error',
            message: 'Fetch Functions ' + err
          })
          */
        }
      }

      this.functions = []

      for (const functions of functionsByNs) {
        for (const fctName of functions.names) {
          const fctSInfos = await this.$pulsar.fetchFunction(functions.namespace + '/' + fctName, functions.cluster)
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
