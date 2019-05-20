<template>
  <div class="dataview">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>Topics</el-breadcrumb-item>
    </el-breadcrumb>
    <loading v-if="loading" />
    <!--
      averageMsgSize: 0
deduplicationStatus: "Disabled"
publishers: []
replication: {}
storageSize: 0
subscriptions: {talk/demo/hello: {…}}
-->
    <div v-else-if="topics.length > 0">
      <el-table
        :data="topics"
        style="width: 100%"
        height_="800"
        :default-sort = "{prop: 'name', order: 'ascending'}">
        <el-table-column
          fixed
          prop="name"
          label="Name"
          sortable
          width="200">
        </el-table-column>
        <el-table-column
          label="Persistent">
          <template slot-scope="scope">
            <i class="el-icon-check" v-if="scope.row.persistent"></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="stats.msgRateIn"
          label="Msg/s in">
        </el-table-column>
        <el-table-column
          prop="stats.msgRateOut"
          label="Msg/s out">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputIn"
          label="Byte/s in">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputOut"
          label="Byte/s out">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="120">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row.id)"
              type="text"
              size="small">
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
        description="Cannot get any information about topics. Maybe you haven't defined any connections."
        show-icon>
      </el-alert>
    </div>
    <div class="button-bar">
      <el-button type="primary" @click="reload()">Reload</el-button>
    </div>
  </div>
</template>

<script>
import loading from '@/components/loading'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'topics',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      loading: false,
      topics: []
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
    ...mapActions('context', ['setTopic', 'setTopics']),

    showDetails(id) {
      this.setTopic(id)
      this.$router.push({ path: '/topics/' + id })
    },

    async reload() {
      this.loading = true
      let queries = []

      let connections = []

      if (this.cluster) {
        connections.push({ url: this.cluster.serviceUrl })
      }
      else {
        await this.$store.dispatch('connections/fetchConnections')
        connections = this.$store.state.connections.connections
      }
      
      connections.forEach(connection => queries.push(this.$axios.$get('/api/admin/v2/tenants?' + connection.url)))

      const tenants = await Promise.all(queries)

      const topicsByNs = []

      for (const [idx, tenantList] of tenants.entries()) {
        for (const tenant of tenantList) {
          const namespaces = await this.$axios.$get('/api/admin/v2/namespaces/' + tenant + '?' + connections[idx].url)
          for (const namespace of namespaces) {
            try {
              const nsTopics = await this.$axios.$get('/api/admin/v2/namespaces/' + namespace + '/topics?' + connections[idx].url)

              if (nsTopics && nsTopics.length > 0) {
                topicsByNs.push({ connection: connections[idx].url, names: nsTopics })
              }
            }
            catch (err) {
              console.error(err)
            }
          }
        }
      }

      this.topics = []

      for (const topics of topicsByNs) {
        for (const topic of topics.names) {
          const topicStats = await this.$axios.$get('/api/admin/v2/' + topic.replace(":/","") + '/stats?' + topics.connection)
          this.topics.push({
            id: this.topics.length,
            connection: topics.connection,
            name: topic.substring(topic.indexOf('://') + 3), 
            persistent: topic.startsWith('persistent'), 
            stats: topicStats })
        }
      }

      this.setTopics(this.topics)

      this.loading = false
    }
  },

  head() {
    return {
      title: 'pulsar-express - topics'
    }
  }
}
</script>
