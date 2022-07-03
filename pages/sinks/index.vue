<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Sinks' } ]" />
    <loading v-if="loading" />
    <div v-else-if="sinks.length > 0">
      <el-table
        :data="sinks"
        style="width: 100%">
        <el-table-column
          fixed
          label="Name"
          prop="sink"
          sortable
          width="250">
          <template slot-scope="scope">
            <a :href="`/sinks/${scope.row.cluster.name}/${scope.row.ns.namespace}/${scope.row.sink}`">
              <el-button type="text" @click.native.prevent="showDetails(scope.row.id)">{{ scope.row.sink }}</el-button>
            </a>
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

      this.sinks = await this.$pulsar.fetchSinks(this.clusters)

      this.sinks = this.sinks.map((ns, idx) => ({ ...ns, id: idx }))
      this.setSinks(this.sinks)

      this.loading = false
    },

    showDetails(id) {
      this.setSink(id)
      const sink = this.sinks[id]
      this.$router.push({ path: '/sinks/' + sink.cluster.name + '/' + sink.ns.namespace + '/' + sink.sink })
    },
  },

  head() {
    return {
      title: 'pulsar-express - sinks'
    }
  }
}
</script>
