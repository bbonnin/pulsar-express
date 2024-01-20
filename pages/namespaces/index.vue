<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Namespaces' } ]" />
    <loading v-if="loading" />
    <div v-else-if="namespaces.length > 0">
      <el-table
        :data="namespaces"
        style="width: 100%">
        <el-table-column
          fixed
          label="Name"
          prop="namespace"
          sortable
          width="250">
          <template slot-scope="scope">
            <el-button type="text" @click.native.prevent="showDetails(scope.row.id)">{{ scope.row.namespace }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="cluster.name"
          label="Cluster">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="400">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row.id)"
              type="primary" plain round
              size="mini">
              Details
            </el-button>
            <el-button
              @click.native.prevent="unloadNamespace(scope.row.id)"
              type="warning" plain round
              size="mini">
              Unload
            </el-button>
            <el-button
              @click.native.prevent="deleteNamespace(scope.row.id)"
              type="danger" plain round
              size="mini">
              Delete
            </el-button>
            <el-button
              @click.native.prevent="forceDeleteNamespace(scope.row.id)"
              type="danger" plain round
              size="mini">
              Force Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about namespaces. Maybe you haven't defined any connections or the brokers are unreachable."
        show-icon>
      </el-alert>
    </div>
    
    <div class="button-bar">
      <el-button type="primary" @click="createVisible = true">Create namespace</el-button>
      <el-button @click="reload()">Reload</el-button>
    </div>

    <el-dialog title="Create a namespace" :visible.sync="createVisible">
      <el-form ref="createForm" :model="newNamespace" :rules="namespaceRules" label-width="200px">
        <el-form-item label="Cluster" prop="cluster">
          <el-select v-model="newNamespace.cluster" placeholder="Cluster">
            <el-option
              v-for="(item, idx) in clusters"
              :key="idx"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Tenant" prop="tenant">
          <el-input v-model="newNamespace.tenant"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-input v-model="newNamespace.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createNamespace('createForm')">Create</el-button>
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
  name: 'namespaces',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      namespaces: [],
      createVisible: false,
      clusters: [],
      newNamespace: {
        cluster: null,
        tenant: 'public',
        name: ''
      },
      namespaceRules: {
        cluster: [
          { required: true, message: 'Please select a cluster', trigger: 'change' }
        ],
        tenant: [
          { required: true, message: 'Please set a tenant name', trigger: 'blur' }
        ],
        name: [
          { required: true, message: 'Please set a namespace name', trigger: 'blur' }
        ],
      },
      loading: false
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
    ...mapActions('context', ['setNamespace', 'setNamespaces']),

    createNamespace: function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$pulsar.createNamespace(this.newNamespace.tenant, this.newNamespace.name, this.newNamespace.cluster)
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Create completed'
              })
              this.reload()
            })
            .catch ((err) => {
              this.$message({
                type: 'error',
                message: 'Create error: ' + (err.response && err.response.data && err.response.data.reason || err)
              })
            })
          this.createVisible = false
          this.newNamespace.name = ''
        }
        return valid
      })
    },

    deleteNamespace(id) {      
      this.$confirm('This will be unrecoverable. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          const ns = this.namespaces[id]

          this.$pulsar.deleteNamespace(ns.namespace, false, ns.cluster)
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
                message: 'Delete error: ' + (err.response && err.response.data && err.response.data.reason || err)
              })
            })
        })
    },
    
    forceDeleteNamespace(id) {      
      this.$confirm('This will also permanently delete the topics under it and can not rollback. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          const ns = this.namespaces[id]

          this.$pulsar.deleteNamespace(ns.namespace, true, ns.cluster)
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
                message: 'Delete error: ' + (err.response && err.response.data && err.response.data.reason || err)
              })
            })
        })
    },
    
    unloadNamespace(id) {      
      this.$confirm('Performing this operation will let the broker removes all producers, consumers, and connections using this namespace, and close all topics (including their persistent store). During that operation, the namespace is marked as tentatively unavailable until the broker completes the unloading action. This operation would result in non-persistent message loss and unexpected connection closure to the clients. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          const ns = this.namespaces[id]

          this.$pulsar.unloadNamespace(ns.namespace, ns.cluster)
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Unload completed'
              })
              this.reload()
            })
            .catch ((err) => {
              this.$message({
                type: 'error',
                message: 'Unload error: ' + (err.response && err.response.data && err.response.data.reason || err)
              })
            })
        })
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

      this.clusters = await this.$pulsar.fetchClusters(connections)
      // Default to first clusters
      this.newNamespace.cluster = this.clusters[0]
      const tenants = await this.$pulsar.fetchTenants(this.clusters)  
      this.namespaces = await this.$pulsar.fetchNamespaces(tenants)

      this.namespaces = this.namespaces.map((ns, idx) => ({ ...ns, id: idx }))
      this.setNamespaces(this.namespaces)

      this.loading = false
    },

    showDetails(id) {
      this.setNamespace(id)
      this.$router.push({ path: '/namespaces/' + id })
    },
  },

  head() {
    return {
      title: 'Namespaces - Pulsar Express'
    }
  }
}
</script>
