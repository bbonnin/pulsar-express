<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Topics' } ]" />
    <loading v-if="loading" />
    <div v-else-if="topics.length > 0">
      <el-form :inline="true">
        <el-form-item label="Search topics" size="small">
          <el-input v-model="search" placeholder="Type to search"></el-input>
        </el-form-item>
      </el-form>
      <el-table
        :data="topics.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
        style="width: 100%"
        height_="800"
        :default-sort = "{prop: 'name', order: 'ascending'}">
        <el-table-column
          fixed
          prop="name"
          label="Name"
          sortable
          width="300">
          <template slot-scope="scope">
            <a :href="`/topics/${scope.row.cluster.name}/${scope.row.persistent ? 'persistent' : 'non-persistent'}/${scope.row.name}`">
              <el-button type="text" @click.native.prevent="showDetails(scope.row.id)">{{ scope.row.name }}</el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column
          label="Persistent"
          sortable
          width="100">
          <template slot-scope="scope">
            <i class="el-icon-check" v-if="scope.row.persistent"></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="stats.msgRateIn"
          label="Msg/s in"
          sortable
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.msgRateOut"
          label="Msg/s out"
          sortable
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputIn"
          label="Byte/s in"
          sortable
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputOut"
          label="Byte/s out"
          sortable
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.storageSize"
          label="Storage size"
          sortable
          :formatter="cellFormatBytesToBestUnit">
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
            <el-button
              @click.native.prevent="deleteTopic(scope.row.id)"
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
        description="Cannot get any information about topics. Maybe you haven't defined any connections or the brokers are unreachable."
        show-icon>
      </el-alert>
    </div>

    <div class="button-bar">
      <!-- TODO: add cluster selection -->
      <el-button type="primary" @click="createVisible = true">Create topic</el-button>
      <el-button @click="reload()">Reload</el-button>
    </div>

    <el-dialog title="Create a topic" :visible.sync="createVisible">
      <el-form ref="createForm" :model="newTopic" :rules="topicRules" label-width="200px">
        <el-form-item label="Cluster" prop="cluster">
          <el-select v-model="newTopic.cluster" placeholder="Cluster">
            <el-option
              v-for="(item, idx) in clusters"
              :key="idx"
              :label="item.name"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Type">
          <el-radio-group v-model="newTopic.type">
            <el-radio label="persistent">Persistent</el-radio>
            <el-radio label="non-persistent">Non-persistent</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Tenant" prop="tenant">
          <el-input v-model="newTopic.tenant"></el-input>
        </el-form-item>
        <el-form-item label="Namespace" prop="namespace">
          <el-input v-model="newTopic.namespace"></el-input>
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="newTopic.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="createTopic('createForm')">Create</el-button>
          <el-button @click="createVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatBytesToBestUnit } from '@/services/utils'
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'topics',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      createVisible: false,
      clusters: [],
      newTopic: {
        cluster: null,
        type: 'persistent',
        tenant: 'public',
        namespace: 'default',
        name: ''
      },
      topicRules: {
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
          { required: true, message: 'Please set a topic name', trigger: 'blur' }
        ],
      },
      loading: false,
      search: '',
      topics: []
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatBytesToBestUnit,

    ...mapActions('context', ['setTopic', 'setTopics']),

    createTopic: function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const fullname = this.newTopic.type + '/' + 
            this.newTopic.tenant + '/' + this.newTopic.namespace + '/' + this.newTopic.name
          this.$pulsar.createTopic(fullname, this.newTopic.cluster)
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
                message: 'Create error: ' + err
              })
            })
          this.createVisible = false
          this.newTopic.name = ''
        }
        return valid
      })
    },

    deleteTopic(id) {      
      this.$confirm('This will permanently delete the topic. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          const topic = this.topics[id]
          let fullname = topic.persistent ? 'persistent/' : 'non-persistent'
          fullname += topic.name

          this.$pulsar.deleteTopic(fullname, topic.cluster)
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

    showDetails(id) {
      const topic = this.topics[id]
      this.$router.push({ path: '/topics/' + topic.cluster.name + '/' + topic.persistent + '/' + topic.name })
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
      // Default to the first cluster on the list
      this.newTopic.cluster = this.clusters[0]
      
      const topicRefs = await this.$pulsar.fetchTopics(this.clusters)

      this.topics = []

      const topicWithStats = (ref, stats) => {
        return {
          cluster: ref.cluster,
          name: ref.topic.substring(ref.topic.indexOf('://') + 3), 
          persistent: ref.topic.startsWith('persistent'), 
          stats: stats
        }
      }

      this.topics = await Promise.all(
        topicRefs.map(ref =>
          this.$pulsar.fetchTopicStats(ref.topic.replace(":/",""), ref.cluster)
            .then((topicStats) => topicWithStats(ref, topicStats))
            .catch((e) => {
              console.error(e);
              return topicWithStats(ref, undefined);
            })
        )
      )

      this.topics = this.topics.map((t, id) => ({ ...t, id }))

      /*for (const ref of topicRefs) {
        const topicStats = await this.$pulsar.fetchTopicStats(ref.topic.replace(":/",""), ref.cluster)
        this.topics.push({
          id: this.topics.length,
          cluster: ref.cluster,
          name: ref.topic.substring(ref.topic.indexOf('://') + 3), 
          persistent: ref.topic.startsWith('persistent'), 
          stats: topicStats })
      }*/

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
