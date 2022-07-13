<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Tenants' } ]" />
    <loading v-if="loading" />
    <div v-else-if="tenants.length > 0">
      <el-table
        :data="tenants"
        style="width: 100%">
        <el-table-column
          sortable
          prop="name"
          label="Name">
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
        <el-table-column
          fixed="right"
          label="Actions"
          width="200">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="deleteTenant(scope.row)"
              type="danger" plain round
              size="mini">
              Delete
            </el-button>
          </template>
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
      <el-button type="primary" @click="createVisible = true">Create tenant</el-button>
      <el-button @click="reload()">Reload</el-button>
    </div>

    <el-dialog title="Create a tenant" :visible.sync="createVisible">
      <el-form ref="createForm" :model="newTenant" :rules="tenantRules" label-width="200px">
        <el-form-item label="Cluster" prop="cluster">
          <el-select v-model="newTenant.cluster" placeholder="Cluster">
          <el-option
            v-for="(item, idx) in clusters"
            :key="idx"
            :label="item.name"
            :value="item">
          </el-option>
        </el-select>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="newTenant.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createTenant('createForm')">Create</el-button>
          <el-button @click="createVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'tenants',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      tenants: [],
      clusters: [],
      loading: false,
      createVisible: false,
      newTenant: {
        name: '',
        cluster: null
      },
      tenantRules: {
        cluster: [
          { required: true, message: 'Please select a cluster', trigger: 'change' }
        ],
        name: [
          { required: true, message: 'Please set a tenant name', trigger: 'blur' }
        ]
      }
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

      this.clusters = await this.$pulsar.fetchClusters(connections)
      
      // Default the cluster to the first on the list
      this.newTenant.cluster = this.clusters[0]
      
      this.tenants = await this.$pulsar.fetchTenantsConfig(this.clusters)

      this.loading = false
    },

    cellFormatJoin(row, column, cellValue, index) {
      return cellValue.join(', ')
    },

    deleteTenant(tenant) {
      this.$confirm('This will permanently delete the tenant (and all namespaces and topics under it). Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          this.$pulsar.deleteTenant(tenant.name, tenant.cluster)
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Delete completed'
              })
              this.reload()
            })
            .catch ((err) => {
              this.$message({
                type: 'error',
                message: 'Delete error: ' + err
              })
            })
        })
    },

    createTenant: function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$pulsar.createTenant(this.newTenant.name, this.newTenant.cluster)
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Creation completed'
              })
              this.reload()
            })
            .catch ((err) => {
              this.$message({
                type: 'error',
                message: 'Creation error: ' + err
              })
            })
          this.createVisible = false
          this.newTeant = { name: '', cluster: null }
        }
        return valid
      })
    }
  },

  head() {
    return {
      title: 'Tenants - Pulsar Express'
    }
  }
}
</script>
