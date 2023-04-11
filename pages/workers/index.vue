<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Workers' } ]" />
    <loading v-if="loading" />
    <div v-else-if="workers.length > 0">
      <el-table
        :data="workers"
        style="width: 100%">
        <el-table-column
          prop="cluster.name"
          label="Cluster"
          sortable>
        </el-table-column>
        <el-table-column
          prop="worker.workerId"
          label="Worker">
        </el-table-column>
        <el-table-column
          prop="worker.workerHostname"
          label="Hostname">
        </el-table-column>
        <el-table-column
          prop="status.status"
          label="Drain">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status && scope.row.status.status == 'ERROR' && scope.row.status.lastError.indexOf(' not found in drain records') <= -1" type="danger" title="{{scope.row.status.lastError}}">
              {{scope.row.status.status}}
            </el-tag>
            <el-tag v-else-if="scope.row.status && scope.row.status.status != 'ERROR'" type="success" title="{{scope.row.status.lastError}">
              {{scope.row.status.status}}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="200">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="drainWorker(scope.row.worker.workerId, scope.row.cluster)"
              type="danger" plain round
              size="mini">
              Drain
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about workers. Maybe you haven't defined any connections or do not have any worker."
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
  name: 'workers',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      workers: [],
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
      this.workers = await this.$pulsar.fetchWorkers(clusters)
      
      const workerWithStatus = (ref, status) => {
        return {
          ...ref,
          status: status
        }
      }
      
      this.workers = await Promise.all(
        this.workers.map(ref =>
          this.$pulsar.fetchWorkerDranStatus(ref.worker.workerId, ref.cluster)
            .then((res) => workerWithStatus(ref, res))
            .catch((e) => {
              console.error(e);
              return workerWithStatus(ref, undefined);
            })
        )
      )

      this.loading = false
    },
    
    drainWorker(workerId, cluster) {
      this.$pulsar.drainWorker(workerId, cluster)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Drainned this worker'
          })
          this.reload()
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Drain error: ' + err
          })
        })
    }
  },

  head() {
    return {
      title: 'Workers - Pulsar Express'
    }
  }
}
</script>
