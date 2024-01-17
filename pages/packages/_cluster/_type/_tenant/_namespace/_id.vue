<template>
  <div class="dataview" v-loading="loading">
    <breadcrumb :items="breadcrumbItems" />
    <div v-if="versions.length > 0">
      <el-table
        :data="versions"
        style="width: 100%">
        <el-table-column
          fixed
          label="Version"
          prop="version"
          sortable
          width="250">
        </el-table-column>
        <el-table-column
          prop="description"
          label="Description">
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="Created">
          <template slot-scope="scope">
            <span>
              {{new Date(scope.row.createTime).toLocaleDateString('en-us', { month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"})}}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="modificationTime"
          label="Modified">
          <template slot-scope="scope">
            <span>
              {{new Date(scope.row.modificationTime).toLocaleDateString('en-us', { month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"})}}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="300">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="deletePackageVersion(scope.row)"
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
        description="Cannot get any information about the package. Maybe you haven't defined any connections or the brokers are unreachable or the package has no version defined."
        show-icon>
      </el-alert>
    </div>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatBoolean } from '@/services/utils'
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import propertyview from '@/components/property-view'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'package',

  layout: 'dataview',

  components: {
    loading, breadcrumb, propertyview
  },

  data() {
    return {
      loading: false,
      versions: []
    }
  },

  computed: {
    ...mapState('context', ['package', 'packages']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: 'Cluster' },
        { path: '/packages', label: 'Packages' },
        { label: this.$route.params.type + ': ' + this.$route.params.id }
      ]
    },

    currentPackage() {
      if (this.packages && this.packages.length > this.package) {
        return this.packages[this.package]
      }

      return null
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatBoolean,

    deletePackageVersion(ref) {      
      this.$confirm('This will also permanently delete the package. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          this.$pulsar.deletePackageVersion(ref.id, ref.cluster)
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
      const clusters = this.clusters.find(c => c.name == this.$route.params.cluster)
      
      this.versions = await this.$pulsar.fetchPackageVersions(this.$route.params.type + '/' + this.$route.params.tenant + '/' + this.$route.params.namespace + '/' + this.$route.params.id, clusters)
      this.loading = false
    }
  },

  head() {
    return {
      title: 'pulsar-express - package - ' + this.$route.params.id
    }
  }
}
</script>

<style scoped>
h3 {
  margin: 50px 0 20px;
  color: #1f2f3d;
}
</style>
