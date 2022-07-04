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
          label="Name"
          prop="name"
          sortable
          width="200">
          <template slot-scope="scope">
            <el-button type="text" @click.native.prevent="showConfig(scope.row)">{{ scope.row.name }}</el-button>
          </template>
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
          width="300"
          label="Quick access">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showItems(scope.row, '/brokers')"
              type="plain" plain round
              size="mini"
              title="Brokers">
              <img src="~/assets/brokers.png" width="18" alt="Brokers"/>
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/tenants')"
              type="plain" plain round
              size="mini"
              title="Tenants">
              <img src="~/assets/tenants.png" width="18" alt="Tenants"/>
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/namespaces')"
              type="plain" plain round
              size="mini"
              title="Namespaces">
              <img src="~/assets/namespaces.png" width="18" alt="Namespaces"/>
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/topics')"
              type="plain" plain round
              size="mini"
              title="Topics">
              <img src="~/assets/topics.png" width="18" alt="Topics"/>
            </el-button>
            <el-button
              @click.native.prevent="showItems(scope.row, '/functions')"
              type="plain" plain round
              size="mini"
              title="Functions">
              <img src="~/assets/functions.png" width="18" alt="Functions"/>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="rebalanceWorkers(scope.row)"
              type="warning" plain round
              size="mini">
              Rebalance worker
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

    <el-drawer
      title="Configuration"
      :visible.sync="configVisible"
      size="50%"
      direction="rtl">
      <div class="config-drawer">
        <el-form ref="configForm" :model="clusterConfig" :rules="configRules" label-width="200px">
          <el-form-item label="HTTP Service URL" prop="serviceUrl">
            <el-input v-model="clusterConfig.serviceUrl"></el-input>
          </el-form-item>
          <el-form-item label="HTTPS Service URL" prop="serviceUrlTls">
            <el-input v-model="clusterConfig.serviceUrlTls"></el-input>
          </el-form-item>
          <el-form-item label="Broker Service URL" prop="brokerServiceUrl">
            <el-input v-model="clusterConfig.brokerServiceUrl"></el-input>
          </el-form-item>
          <el-form-item label="Broker Service URL (TLS)" prop="brokerServiceUrlTls">
            <el-input v-model="clusterConfig.brokerServiceUrlTls"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateConfig('configForm')">Update</el-button>
            <el-button @click="configVisible = false">Cancel</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
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
      loading: false,
      configVisible: false,
      clusterConfig: {},
      configRules: { 
        serviceUrl: [
          { required: true, message: 'Please set a url', trigger: 'blur' },
          { pattern: /http:\/\//, message: 'URL must start with http://', trigger: 'blur' }
        ],
        serviceUrlTls: [
          { pattern: /https:\/\//, message: 'URL must start with https://', trigger: 'blur' }
        ],
        brokerServiceUrl: [
          { required: true, message: 'Please set a url', trigger: 'blur' },
          { pattern: /pulsar:\/\//, message: 'URL must start with pulsar://', trigger: 'blur' }
        ],
        brokerServiceUrlTls: [
          { pattern: /pulsar\+ssl:\/\//, message: 'URL must start with pulsar+ssl://', trigger: 'blur' }
        ]
      }
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

    showConfig(cluster) {
      this.configVisible = true
      this.clusterConfig = cluster
    },

    updateConfig(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$pulsar.updateClusterConfig(this.clusterConfig)
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Update completed'
              })
              this.reload()
            })
            .catch ((err) => {
              this.$message({
                type: 'error',
                message: 'Update error: ' + err
              })
            })
          this.configVisible = false
          this.clusterConfig = {}
        }
        return valid
      })
    },

    async reload() {
      await this.$store.dispatch('connections/fetchConnections')

      this.loading = true
      this.clusters = await this.$pulsar.fetchClusters(this.connections)
      this.loading = false
    },
    
    rebalanceWorkers(cluster) {
      this.$pulsar.rebalanceWorkers(cluster)
        .then((resp) => {
          this.$message({
            message: 'Rebalanced: ' + resp
          })
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + err
          })
        })
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

.config-drawer {
  padding: 20px;
}
</style>
