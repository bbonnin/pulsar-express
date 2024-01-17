<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Packages' } ]" />
    <loading v-if="loading" />
    <div v-else-if="packages.length > 0">
      <el-table
        :data="packages"
        style="width: 100%">
        <el-table-column
          fixed
          label="Name"
          prop="name"
          sortable
          width="350">
          <template slot-scope="scope">
            <el-button type="text" @click.native.prevent="showDetails(scope.row)">{{ scope.row.name }}</el-button>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="Type">
        </el-table-column>
        <el-table-column
          prop="ns.namespace"
          label="Namespace">
        </el-table-column>
        <el-table-column
          prop="cluster.name"
          label="Cluster">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="300">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row)"
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
        description="Cannot get any information about packages. Maybe you haven't defined any connections or the brokers are unreachable."
        show-icon>
      </el-alert>
    </div>
    
    <div class="button-bar">
      <el-button type="primary" @click="createVisible = true">Create package</el-button>
      <el-button @click="reload()">Reload</el-button>
    </div>

    <el-dialog title="Create a package" :visible.sync="createVisible">
      <el-form ref="createForm" :model="newPackage" :rules="packageRules" label-width="200px">
        <el-form-item label="Cluster" prop="cluster">
          <el-select v-model="newPackage.cluster" placeholder="Cluster">
            <el-option
              v-for="(item, idx) in clusters"
              :key="idx"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Type" prop="type">
          <el-select v-model="newPackage.type" placeholder="Cluster">
            <el-option label="Function" value="function"></el-option>
            <el-option label="Source" value="source"></el-option>
            <el-option label="Sink" value="sink"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Tenant" prop="tenant">
          <el-input v-model="newPackage.tenant"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-input v-model="newPackage.namespace"></el-input>
        </el-form-item>
        <el-form-item label="Package name" prop="name">
          <el-input v-model="newPackage.name" placeholder="example_package_name"></el-input>
        </el-form-item>
        <el-form-item label="Version" prop="name">
          <el-input v-model="newPackage.version" placeholder="1.0"></el-input>
        </el-form-item>
        <el-form-item label="File">
          <input type="file" @change="selectFileChange"></input>
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="newPackage.description"></el-input>
        </el-form-item>
        <el-form-item label="Properties">
          <el-input v-model="newPackage.props" :autosize="{minRows: 1}" type="textarea" placeholder="{&quot;property&quot;: &quot;value&quot;}"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createPackage('createForm')">Create</el-button>
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
  name: 'packages',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      packages: [],
      createVisible: false,
      clusters: [],
      newPackage: {
        file: [],
        cluster: null,
        type: null,
        tenant: 'public',
        namespace: 'default',
        name: '',
        version: '',
        description: '',
        props: null
      },
      namespaceRules: {
        cluster: [
          { required: true, message: 'Please select a cluster', trigger: 'change' }
        ],
        tenant: [
          { required: true, message: 'Please set a tenant name', trigger: 'blur' }
        ],
        namespace: [
          { required: true, message: 'Please set a namespace name', trigger: 'blur' }
        ],
        name: [
          { required: true, message: 'Please set a package name', trigger: 'blur' }
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
    ...mapActions('context', ['setPackage', 'setPackages']),

    createPackage(formName) {
      var metadata = {
        description: this.newPackage.description
      }
      
      if (this.newPackage.props) {
        props = {}
        try {
          props = JSON.parse(this.newPackage.props);
        } catch (e) {
          this.$message({
            type: 'error',
            message: 'Can not parse properties, please make sure it is valid JSON: ' + e
          })
          return;
        }
        
        metadata.properties = props
      }
      
      const blob = new Blob([JSON.stringify(metadata)], { type: "application/json"});
      
      const formData = new FormData();
      formData.append("metadata", blob)
      formData.append("file", this.newPackage.file[0])
      
      this.$pulsar.createPackage(this.newPackage.type, this.newPackage.tenant, this.newPackage.namespace, this.newPackage.name, this.newPackage.version, this.clusters[0], formData)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Create new package successfully!'
          })
          this.reload()
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Create error: ' + (err.response && err.response.data && err.response.data.reason || err)
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
      
      // Default to first clusters
      this.newPackage.cluster = this.clusters[0]
      this.clusters = await this.$pulsar.fetchClusters(connections)

      this.packages = await this.$pulsar.fetchPackages(this.clusters)
      this.setPackages(this.packages)

      this.loading = false
    },

    showDetails(ref) {
      this.setPackage(ref.id)
      this.$router.push({ path: '/packages/' + ref.cluster.name + '/' + ref.id })
    },
    
    selectFileChange(e) {
      this.newPackage.file = e.target.files;
    }
  },

  head() {
    return {
      title: 'Packages - Pulsar Express'
    }
  }
}
</script>
