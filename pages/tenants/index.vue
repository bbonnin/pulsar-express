<template>
  <div class="dataview">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/overview' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/clusters' }">{{cluster ? cluster.name : 'All clusters'}}</el-breadcrumb-item>
      <el-breadcrumb-item>Tenants</el-breadcrumb-item>
    </el-breadcrumb>
    <loading v-if="loading" />
    <div v-else-if="tenants.length > 0">
      <el-table
        :data="tenants"
        style="width: 100%">
        <el-table-column
          prop="name"
          label="Tenant name">
        </el-table-column>
        <el-table-column
          prop="config.adminRoles"
          label="Admin roles"
          :formatter="cellFormatJoin">
        </el-table-column>
        <el-table-column
          prop="config.allowedClusters"
          label="Allowed clusters"
          :formatter="cellFormatJoin">
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about tenants. Maybe you haven't defined any connections or the brokers are unreachable."
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
import { mapState, mapActions } from 'vuex'

export default {
  name: 'tenants',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      tenants: [],
      loading: false
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
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
      this.tenants = await this.$pulsar.fetchTenantsConfig(clusters)

      this.loading = false
    },

    cellFormatJoin(row, column, cellValue, index) {
      return cellValue.join(', ')
    }
  },

  head() {
    return {
      title: 'pulsar-express - tenants'
    }
  }
}
</script>
