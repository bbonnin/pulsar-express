<template>
  <div class="dataview" v-loading="loading">
    <div v-if="currentTopic" v-loading="loading">
      
      <breadcrumb :items="breadcrumbItems" />
      
      <h3>Stats</h3>
      <el-table
        :data="infos"
        style="width: 100%"
        height_="800">
        <el-table-column
          prop="msgRateIn"
          label="Msg/s in"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="msgRateOut"
          label="Msg/s out"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="msgThroughputIn"
          label="Byte/s in"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="msgThroughputOut"
          label="Byte/s out"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="averageMsgSize"
          label="Avg msg size (bytes)"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="storageSize"
          label="Storage size"
          :formatter="cellFormatBytesToBestUnit">
        </el-table-column>
      </el-table>

      <h3>Subscriptions</h3>
      <el-table
          :data="subscriptions">
        <el-table-column type="expand">
          <template slot-scope="props">
            <div v-if="props.row.consumers.length == 0">
              No consumer
            </div>
            <div v-else>
              <el-table
                :data="props.row.consumers">
                <el-table-column
                    prop="consumerName"
                    label="Consumer name">
                </el-table-column>
                <el-table-column
                    prop="address"
                    label="Address">
                </el-table-column>     
                <el-table-column
                    prop="connectedSince"
                    label="Connected since"
                    :formatter="cellFormatDateSince">
                </el-table-column>
                <el-table-column
                    prop="clientVersion"
                    label="Client version">
                </el-table-column>
                <el-table-column
                    prop="msgRateOut"
                    label="Msg/s out"
                    :formatter="cellFormatFloat">
                </el-table-column>
                <el-table-column
                    prop="msgThroughputOut"
                    label="Byte/s out"
                    :formatter="cellFormatFloat">
                </el-table-column>
                <el-table-column
                    prop="msgRateRedeliver"
                    label="Msg/s redeliver"
                    :formatter="cellFormatFloat">
                </el-table-column>
                <el-table-column
                    prop="unackedMessages"
                    label="Unacked">
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column
            prop="name"
            label="Name">
        </el-table-column>
        <el-table-column
            prop="type"
            label="Type">
        </el-table-column>
        <el-table-column
          prop="msgRateOut"
          label="Msg/s out"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="msgThroughputOut"
          label="Byte/s out"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="msgRateExpired"
          label="Msg/s expired"
          :formatter="cellFormatFloat">
        </el-table-column>msgBacklog
        <el-table-column
          prop="msgRateRedeliver"
          label="Msg/s redeliver"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="msgBacklog"
          label="Backlog">
        </el-table-column>
        <el-table-column
          prop="unackedMessages"
          label="Unacked">
        </el-table-column>
      </el-table>

      <div class="button-bar">
        <el-dropdown @command="handleAction">
          <el-button type="primary">
            Actions <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="peekMessages">Peek messages</el-dropdown-item>
            <el-dropdown-item command="getLastCommitMessage">Get last commit message</el-dropdown-item>
            <el-dropdown-item command="getPublishedMessageJustAfter">Get published message just after a timestamp</el-dropdown-item>
            <el-dropdown-item command="resetSubscription">Reset subscription</el-dropdown-item>
            <el-dropdown-item command="createMissedPartitions">Create missed partitions</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button @click="reload()">Reload</el-button>
      </div>
    </div>
    <div v-else>
      <el-alert
        title="Oops!"
        type="error"
        description="It seems that this topic does not exist..."
        show-icon>
      </el-alert>
    </div>

    <el-dialog title="Peek messages" :visible.sync="peekMessagesVisible">
      <el-form ref="peekMsgForm" :model="peekMessagesInfo" :rules="peekMsgRules" label-width="200px">
        <el-form-item label="Subscription" prop="subscription">
          <el-select v-model="peekMessagesInfo.subscription" placeholder="Please select a subscription">
            <el-option v-for="sub in subscriptions" :key="sub.name" :label="sub.name" :value="sub.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Nb of messages" prop="count">
          <el-input v-model.number="peekMessagesInfo.count"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="peekMessages('peekMsgForm')">Peek messages</el-button>
          <el-button @click="peekMessagesVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
      <div>
        <el-table
          v-if="lastMessages.length > 0"
          :data="lastMessages"
          style="width: 100%"
          height="65vh">
          <el-table-column
            sortable
            width="300"
            prop="publishTime"
            label="Publish Time">
          </el-table-column>
          <el-table-column
            prop="text"
            label="Message as text">
          </el-table-column>
          
        </el-table>
      </div>
    </el-dialog>
    
    <el-dialog title="Last commit message" :visible.sync="lastCommitMessagesVisible">
      <div>
        <div v-if="lastCommitMessage">
            <span>{{lastCommitMessage}}</span>
        </div>
        <br />
        <el-button @click="lastCommitMessagesVisible = false">Close</el-button>
      </div>
    </el-dialog>
    
    <el-dialog title="Published message just after timestamp" :visible.sync="publishedMessageJustAfterTimestampVisible">
      <el-form ref="publishedMsgJustAfterForm" :model="publishedMsgJustAfterInfo" :rules="publishedMsgJustAfterRules" label-width="200px">
        <el-form-item label="Timestamp" prop="timestamp">
          <el-date-picker
            v-model="publishedMsgJustAfterInfo.timestamp"
            type="datetime"
            placeholder="Pick a Date"
            format="yyyy/MM/DD hh:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getPublishedMessageJustAfter('publishedMsgJustAfterForm')">Get message</el-button>
          <el-button @click="publishedMessageJustAfterTimestampVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
      <div>
        <div v-if="publishedMessageJustAfterTimestamp">
            <span>{{publishedMessageJustAfterTimestamp}}</span>
        </div>
      </div>
    </el-dialog>
    
    <el-dialog title="Reset subscription" :visible.sync="resetSubscriptionVisible">
      <el-form ref="resetSubscriptionForm" :model="resetSubscriptionInfo" :rules="resetSubscriptionRules" label-width="200px">
        <el-form-item label="Subscription" prop="subscription">
          <el-select v-model="resetSubscriptionInfo.subscription" placeholder="Please select a subscription">
            <el-option v-for="sub in subscriptions" :key="sub.name" :label="sub.name" :value="sub.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Timestamp" prop="timestamp">
          <el-date-picker
            v-model="resetSubscriptionInfo.timestamp"
            type="datetime"
            placeholder="Pick a Date"
            format="yyyy/MM/DD hh:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="resetSubscription('resetSubscriptionForm')">Reset subscription</el-button>
          <el-button @click="resetSubscriptionVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
      <div>
        <el-table
          v-if="lastMessages.length > 0"
          :data="lastMessages"
          style="width: 100%"
          height="65vh">
          <el-table-column
            sortable
            width="300"
            prop="publishTime"
            label="Publish Time">
          </el-table-column>
          <el-table-column
            prop="text"
            label="Message as text">
          </el-table-column>
          
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatBytesToBestUnit, cellFormatDateSince } from '@/services/utils'
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'topic',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      loading: false,
      stats: null,
      lastMessages: [],
      peekMessagesVisible: false,
      peekMessagesInfo: {
        count: 1,
        subscription: ''
      },
      peekMsgRules: {
        subscription: [
          { required: true, message: 'Please select a subscription', trigger: 'change' }
        ],
        count: [{
            required: true, trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!Number.isInteger(value) || value <= 0) {
                callback(new Error('Please set a value > 0'));
              } else {
                callback()
              }
            }
          }
        ]
      },
      lastCommitMessage: '',
      lastCommitMessagesVisible: false,
      publishedMsgJustAfterInfo: {
        timestamp: new Date()
      },
      publishedMsgJustAfterRules: {
        timestamp: [
          { required: true, message: 'Please select a timestamp', trigger: 'change' }
        ]
      },
      publishedMessageJustAfterTimestamp: '',
      publishedMessageJustAfterTimestampVisible: false,
      resetSubscriptionInfo: {
        timestamp: new Date(),
        subscription: ''
      },
      resetSubscriptionRules: {
        subscription: [
          { required: true, message: 'Please select a subscription', trigger: 'change' }
        ]
      },
      resetSubscriptionVisible: false
    }
  },

  computed: {
    ...mapState('context', ['topic', 'topics']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: 'Cluster ' + this.currentTopic.cluster.name },
        { path: '/topics', label: 'Topics' },
        { label: this.fullname }
      ]
    },

    currentTopic() {
      if (this.topics && this.topics.length > this.topic) {
        return this.topics[this.topic]
      }

      return null
    },

    fullname() {
      const name = this.currentTopic.persistent ? "persistent" : "non-persistent"
      return name + '://' + this.currentTopic.name
    },

    infos() {
      if (this.stats) {
        return [ this.stats ]
      }
      return []
    },

    subscriptions() {
      if (this.stats) {
        return this._.map(this.stats.subscriptions, (infos, name) => ({ name, ...infos}))
      }
      return []
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatBytesToBestUnit,
    cellFormatDateSince,
    
    ...mapActions('context', ['setTopic', 'setTopics']),

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
      const cluster = this.clusters.find(c => c.name == this.$route.params.cluster)
      
      const topicName = this.$route.params.tenant + '/' + this.$route.params.namespace + '/' + this.$route.params.topic;

      this.setTopics([
        {
          cluster: cluster,
          name: this.$route.params.tenant + '/' + this.$route.params.namespace + '/' + this.$route.params.topic, 
          persistent: this.$route.params.persistent == 'persistent', 
          stats: await this.$pulsar.fetchTopicStats(this.$route.params.persistent + '/' + topicName, cluster)
        }
      ])
      this.setTopic(0)
      this.stats = this.currentTopic.stats
      
      this.loading = false
    },

    handleAction(action) {
      switch (action) {
        case 'peekMessages':
          this.peekMessagesVisible = true
          break
        case 'getLastCommitMessage':
          this.getLastCommitMessage()
          this.lastCommitMessagesVisible = true
          break
        case 'getPublishedMessageJustAfter':
          this.publishedMessageJustAfterTimestampVisible = true
          break
        case 'resetSubscription':
          this.resetSubscriptionVisible = true
          break
        case 'createMissedPartitions':
          this.createMissedPartitions()
          break
      }
    },

    peekMessages(formName) {
      this.lastMessages = []
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let topicName = this.currentTopic.persistent ? "persistent" : "non-persistent"
          topicName += '/' + this.currentTopic.name

          for (let i=1; i <= this.peekMessagesInfo.count; i++) {
            this.$pulsar.peekMessages(topicName, this.peekMessagesInfo.subscription, i, this.currentTopic.cluster)
              .then((resp) => {
                this.lastMessages.push({ 
                  raw: resp.data, text: resp.data.substring(6), 
                  publishTime: resp.headers['x-pulsar-publish-time'].replace('T', ' ')
                })
              })
              .catch ((err) => {
                this.$message({
                  type: 'error',
                  message: 'Error: ' + err
                })
              })
          }
          //this.peekMessagesVisible = false
        }
        else {
          return false
        }
      })
    },
    
    async getLastCommitMessage() {
      this.loading = true
      this.lastCommitMessage = await this.$pulsar.getLastCommitMessages((this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name, this.currentTopic.cluster)
      this.loading = false
    },
    
    getPublishedMessageJustAfter(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name
      this.$pulsar.getMessagesPublishedJustAfterTimestamp(topicName, Math.floor(new Date(this.publishedMsgJustAfterInfo.timestamp).getTime() / 1000), this.currentTopic.cluster)
        .then((resp) => {
          console.log(resp)
          this.publishedMessageJustAfterTimestamp = resp
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + err
          })
        })
    },
    
    resetSubscription(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name
      this.$pulsar.resetSubscription(topicName, this.resetSubscriptionInfo.subscription, Math.floor(new Date(this.resetSubscriptionInfo.timestamp).getTime() / 1000), this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Reset the subscription successfully!'
          })
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + err
          })
        })
    },
    
    createMissedPartitions() {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name
      this.$pulsar.createMissedPartitions(topicName, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Created missed partitions!'
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
      title: 'pulsar-express - topic'
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
