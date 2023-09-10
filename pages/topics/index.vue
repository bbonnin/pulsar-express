<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Topics' } ]" />
    <loading v-if="loading" />
    <div v-else-if="topics.length > 0">
      <el-form :inline="true">
        <el-form-item label="Search topics" size="small">
          <el-input v-model="search" placeholder="Type to search" @change="fetchTopicStats()"></el-input>
        </el-form-item>
      </el-form>
      <el-table
        :data="topicData"
        style="width: 100%"
        height_="800">
        <el-table-column
          fixed
          prop="name"
          label="Name"
          width="300">
          <template slot-scope="scope">
            <a :href="`/topics/${scope.row.cluster.name}/${scope.row.persistent ? 'persistent' : 'non-persistent'}/${scope.row.name}`">
              <el-button type="text" @click.native.prevent="showDetails(scope.row)" style="text-align: left">
                <p style="font-size: small; color: darkgray; margin-bottom: 4px">{{scope.row.name.substring(0, scope.row.name.lastIndexOf('/'))}}/</p>
                {{ shortenTopicName(scope.row.name) }}
              </el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column
          label="Persistent"
          width="100">
          <template slot-scope="scope">
            <i class="el-icon-check" v-if="scope.row.persistent"></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="stats.msgRateIn"
          label="Msg/s in"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.msgRateOut"
          label="Msg/s out"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputIn"
          label="Byte/s in"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputOut"
          label="Byte/s out"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="stats.storageSize"
          label="Storage size"
          :formatter="cellFormatBytesToBestUnit">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="200">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row)"
              type="primary" plain round
              size="mini">
              Details
            </el-button>
            <el-button
              @click.native.prevent="deleteTopic(scope.row)"
              type="danger" plain round
              size="mini">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <br />
      
      <div style="text-align: center">
          <el-pagination
              background
              layout="prev, pager, next"
              @current-change="handlePageChange"
              :page-size="pageSize"
              :total="total"
              :current-page="page">
          </el-pagination>
      </div>
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
      topics: [],
      page: 1,
      pageSize: 30,
      total: 0,
      filtered: []
    }
  },

  computed: {
    ...mapState('context', ['cluster']),
    
    topicData() {
        if(this.search == null) return this.topics;
      
        this.filtered = this.topics.filter(data => !this.search || data.name.toLowerCase().includes(this.search.toLowerCase()));
        
        this.total = this.filtered.length;
        
        this.page = Math.max(1, Math.min(this.page, Math.ceil(this.total / this.pageSize)));
        return this.filtered.slice(this.pageSize * this.page - this.pageSize, this.pageSize * this.page);
    }
  },

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
                message: 'Create error: ' + (err.response && err.response.data && err.response.data.reason || err)
              })
            })
          this.createVisible = false
          this.newTopic.name = ''
        }
        return valid
      })
    },

    deleteTopic(ref) {      
      this.$confirm('This will permanently delete the topic. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          let fullname = ref.persistent ? 'persistent/' : 'non-persistent'
          fullname += ref.name

          this.$pulsar.deleteTopic(fullname, ref.cluster)
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

    showDetails(ref) {
      this.$router.push({ path: '/topics/' + ref.cluster.name + '/' + (ref.persistent ? 'persistent' : 'non-persistent') + '/' + ref.name })
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

      this.topics = topicRefs.map((ref) => ({ topic: ref.topic, name: ref.topic.substring(ref.topic.indexOf('://') + 3), cluster: ref.cluster, persistent: ref.topic.startsWith('persistent') }))

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
      
      this.fetchTopicStats()
    },
    
    async fetchTopicStats() {
      this.loading = true
      var filteredTopics = this.topics.filter(data => !this.search || data.name.toLowerCase().includes(this.search.toLowerCase()));
      filteredTopics = filteredTopics.slice(this.pageSize * this.page - this.pageSize, this.pageSize * this.page)
    
      const topicWithStats = (ref, stats) => {
        return {
          ...ref, 
          stats: stats
        }
      }
      
      filteredTopics = await Promise.all(
        filteredTopics.map(ref =>
          this.$pulsar.fetchTopicStats(ref.topic.replace(":/",""), ref.cluster)
            .then((topicStats) => topicWithStats(ref, topicStats))
            .catch((e) => {
              console.error(e);
              return topicWithStats(ref, undefined);
            })
        )
      )
      
      for(const ref of filteredTopics) {
        for(var i=0; i < this.topics.length; i++) {
            if (this.topics[i].topic == ref.topic) {
                this.topics[i].stats = ref.stats
                break
            }
        }
      }
      
      this.setTopics(this.topics)
      
      this.loading = false
    },
    
    handlePageChange(val) {
        this.page = val;
        this.fetchTopicStats();
    },
    
    shortenTopicName(fullTopicName) {
        if (fullTopicName.match(/-partition-[0-9]+$/)) {
            var topicName = fullTopicName.substring(fullTopicName.lastIndexOf('/') + 1)
            return topicName.substring(0, topicName.lastIndexOf('-partition-')) + ' (' + topicName.substring(topicName.lastIndexOf('-partition-') + 11) + ')'
        }
        return fullTopicName.substring(fullTopicName.lastIndexOf('/') + 1)
    }
  },

  head() {
    return {
      title: 'Topics - Pulsar Express'
    }
  }
}
</script>
