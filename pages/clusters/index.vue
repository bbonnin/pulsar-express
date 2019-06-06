<template>
  <div class="dataview">
    <breadcrumb :items="[ { label: 'Clusters' } ]" />
    <loading v-if="loading" />
    <div v-else-if="clusters.length > 0">
      <el-table
        :data="clusters"
        style="width: 100%"
        :default-sort = "{prop: 'name', order: 'descending'}">
        <el-table-column
          fixed
          prop="name"
          label="Name"
          sortable
          width="200">
        </el-table-column>
        <el-table-column
          prop="brokerServiceUrl"
          label="Broker URL">
        </el-table-column>
        <el-table-column
          prop="serviceUrl"
          label="Service URL">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="460">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showItems(scope.row, '/brokers')"
              type="primary" plain round
              size="mini">
              Brokers
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/tenants')"
              type="primary" plain round
              size="mini">
              Tenants
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/namespaces')"
              type="primary" plain round
              size="mini">
              Namespaces
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/topics')"
              type="primary" plain round
              size="mini">
              Topics
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/functions')"
              type="primary" plain round
              size="mini">
              Functions
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about clusters. Maybe you haven't defined any connections or the brokers are unreachable."
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
  name: 'clusters',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      clusters: [],
      loading: false
    }
  },

  computed: mapState('connections', ['connections']),

  mounted() {
    this.reload()
  },

  methods: {
    ...mapActions('context', ['setCluster']),

    showItems(cluster, path) {
      this.setCluster(cluster)
      this.$router.push({ path })
    },

    async reload() {
      await this.$store.dispatch('connections/fetchConnections')

      this.loading = true
      this.clusters = await this.$pulsar.fetchClusters(this.connections)
      this.loading = false
    }
  },

  head() {
    return {
      title: 'pulsar-express - clusters'
    }
  }
}
</script>

<style scoped>
.el-button+.el-button {
  margin-left: 0px;
}
</style>
