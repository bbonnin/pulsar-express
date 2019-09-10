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

    <el-dialog title="Peek messages" :visible.sync="peekMessagesVisible" fullscreen>
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
      }
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
    if (this.currentTopic) {
      this.reload()
    }
  },

  methods: {
    cellFormatFloat,
    cellFormatBytesToBestUnit,
    cellFormatDateSince,

    async reload() {
      this.loading = true
      const persist = this.currentTopic.persistent ? "persistent" : "non-persistent"
      this.stats = await this.$pulsar.fetchTopicStats(persist + '/' + this.currentTopic.name, this.currentTopic.cluster)
      this.loading = false
    },

    handleAction(action) {
      switch (action) {
        case 'peekMessages':
          this.peekMessagesVisible = true
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
