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
      
      <h3>Metadata</h3>

      <div v-if="Object.keys(metadata).length == 0">
        No metadata
      </div>
      <div v-else>
        <propertyview :props="metadata"></propertyview>
      </div>
      
      <h3>Properties</h3>

      <div v-if="Object.keys(policies).length == 0">
        No properties
      </div>
      <div v-else>
        <propertyview :props="policies"></propertyview>
      </div>
      
      <div class="button-bar">
        <el-dropdown @command="handleAction">
          <el-button type="primary">
            Topic actions <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="getLastCommitMessage">Get last commit message</el-dropdown-item>
            <el-dropdown-item command="getPublishedMessageJustAfter">Get published message just after a time</el-dropdown-item>
            <el-dropdown-item command="createMissedPartitions">Create missed partitions</el-dropdown-item>
            <el-dropdown-item command="setTopicDispatchRate">Set dispatch rate</el-dropdown-item>
            <el-dropdown-item command="setTopicSubscriptionDispatchRate">Set subscription dispatch rate</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button @click="reload()">Reload</el-button>
        <el-button @click="trimTopic()" type="warning">Trim</el-button>
        <el-button @click="unloadTopic()" type="warning">Unload</el-button>
        <el-button @click="truncateTopic()" type="danger">Truncate</el-button>
        <el-button @click="confirmDeleteVisible = true" type="danger">Delete</el-button>
      </div>
      
      <h3>Publishers</h3>
      <el-table
          :data="publishers">
        <el-table-column
            prop="producerName"
            label="Name">
        </el-table-column>
        <el-table-column
            prop="accessMode"
            label="Type">
        </el-table-column>
        <el-table-column
          prop="msgRateIn"
          label="Msg/s in"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="msgThroughputIn"
          label="Byte/s in"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="averageMsgSize"
          label="Msg size avg"
          :formatter="cellFormatFloat">
        </el-table-column>
        <el-table-column
          prop="address"
          label="Address">
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
            Subscription actions <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="peekMessages">Peek messages</el-dropdown-item>
            <el-dropdown-item command="resetSubscription">Reset to a time</el-dropdown-item>
            <el-dropdown-item command="skipMesOnSubscription">Skip messages</el-dropdown-item>
            <el-dropdown-item command="skipAllMesOnSubscription">Skip all messages</el-dropdown-item>
            <el-dropdown-item command="deleteSubscription">Delete</el-dropdown-item>
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
    
    <el-dialog title="Skip messages on subscription" :visible.sync="skipMesOnSubscriptionVisible">
      <el-form ref="skipMesOnSubscriptionForm" :model="skipMesOnSubscriptionInfo" :rules="skipMesOnSubscriptionRules" label-width="200px">
        <el-form-item label="Subscription" prop="subscription">
          <el-select v-model="skipMesOnSubscriptionInfo.subscription" placeholder="Please select a subscription">
            <el-option v-for="sub in subscriptions" :key="sub.name" :label="sub.name" :value="sub.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Num of messages" prop="numMes">
          <el-input v-model.number="skipMesOnSubscriptionInfo.numMes"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="skipMesOnSubscription('skipMesOnSubscriptionForm')">Submit</el-button>
          <el-button @click="skipMesOnSubscriptionVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <el-dialog title="Skip all messages on subscription" :visible.sync="skipAllMesOnSubscriptionVisible">
      <el-form ref="skipAllMesOnSubscriptionForm" :model="skipMesOnSubscriptionInfo" :rules="skipMesOnSubscriptionRules" label-width="200px">
        <el-form-item label="Subscription" prop="subscription">
          <el-select v-model="skipMesOnSubscriptionInfo.subscription" placeholder="Please select a subscription">
            <el-option v-for="sub in subscriptions" :key="sub.name" :label="sub.name" :value="sub.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="skipAllMesOnSubscription('skipMesOnSubscriptionForm')">Submit</el-button>
          <el-button @click="skipAllMesOnSubscriptionVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <el-dialog title="Set topic dispatch rate" :visible.sync="setTopicDispatchRateVisible">
      <el-form ref="setTopicDispatchRateForm" :model="setTopicDispatchRateInfo" :rules="setTopicDispatchRateRules" label-width="200px">
        <el-form-item label="Throttling rate in byte" prop="dispatchThrottlingRateInByte">
          <el-input v-model.number="setTopicDispatchRateInfo.dispatchThrottlingRateInByte"></el-input>
        </el-form-item>
        <el-form-item label="Throttling rate in msg" prop="dispatchThrottlingRateInMsg">
          <el-input v-model.number="setTopicDispatchRateInfo.dispatchThrottlingRateInMsg"></el-input>
        </el-form-item>
        <el-form-item label="Rate period in seconds" prop="ratePeriodInSecond">
          <el-input v-model.number="setTopicDispatchRateInfo.ratePeriodInSecond"></el-input>
        </el-form-item>
        <el-form-item label="Relative to publish rate?" prop="relativeToPublishRate">
          <el-checkbox v-model.boolean="setTopicDispatchRateInfo.relativeToPublishRate"></el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="setTopicDispatchRate('setTopicDispatchRateForm')">Submit</el-button>
          <el-button @click="setTopicDispatchRateVisible = false">Close</el-button>
          <el-button type="danger" @click="deleteTopicDispatchRate('setTopicDispatchRateForm')">Unset</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <el-dialog title="Set subscription dispatch rate" :visible.sync="setTopicSubscriptionDispatchRateVisible">
      <el-form ref="setTopicSubscriptionDispatchRateForm" :model="setTopicSubscriptionDispatchRateInfo" :rules="setTopicSubscriptionDispatchRateRules" label-width="200px">
        <el-form-item label="Throttling rate in byte" prop="dispatchThrottlingRateInByte">
          <el-input v-model.number="setTopicSubscriptionDispatchRateInfo.dispatchThrottlingRateInByte"></el-input>
        </el-form-item>
        <el-form-item label="Throttling rate in msg" prop="dispatchThrottlingRateInMsg">
          <el-input v-model.number="setTopicSubscriptionDispatchRateInfo.dispatchThrottlingRateInMsg"></el-input>
        </el-form-item>
        <el-form-item label="Rate period in seconds" prop="ratePeriodInSecond">
          <el-input v-model.number="setTopicSubscriptionDispatchRateInfo.ratePeriodInSecond"></el-input>
        </el-form-item>
        <el-form-item label="Relative to publish rate?" prop="relativeToPublishRate">
          <el-checkbox v-model.boolean="setTopicSubscriptionDispatchRateInfo.relativeToPublishRate"></el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="setTopicSubscriptionDispatchRate('setTopicSubscriptionDispatchRateForm')">Submit</el-button>
          <el-button @click="setTopicSubscriptionDispatchRateVisible = false">Close</el-button>
          <el-button type="danger" @click="deleteTopicSubscriptionDispatchRate('setTopicSubscriptionDispatchRateForm')">Unset</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <el-dialog title="Delete subscription" :visible.sync="deleteSubscriptionVisible">
      <el-form ref="deleteSubscriptionForm" :model="deleteSubscriptionInfo" :rules="deleteSubscriptionRules" label-width="200px">
        <el-form-item label="Subscription" prop="subscription">
          <el-select v-model="deleteSubscriptionInfo.subscription" placeholder="Please select a subscription">
            <el-option v-for="sub in subscriptions" :key="sub.name" :label="sub.name" :value="sub.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Force delete?">
          <el-checkbox v-model.boolean="deleteSubscriptionInfo.forceDelete"></el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="deleteSubscription('deleteSubscriptionForm')">Delete</el-button>
          <el-button @click="deleteSubscriptionVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
    
    <el-dialog title="Confirm delete" :visible.sync="confirmDeleteVisible">
      <el-form ref="confirmDeleteForm" :model="confirmDeleteInfo" :rules="confirmDeleteRules" label-width="200px">
        <el-form-item label="Force delete?">
          <el-checkbox v-model.boolean="confirmDeleteInfo.forceDelete"></el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" @click="deleteTopic('confirmDeleteForm')">Delete</el-button>
          <el-button @click="confirmDeleteVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatBytesToBestUnit, cellFormatDateSince } from '@/services/utils'
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import propertyview from '@/components/property-view'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'topic',

  layout: 'dataview',

  components: {
    loading, breadcrumb, propertyview
  },

  data() {
    return {
      loading: false,
      stats: null,
      metadata: {},
      policies: {},
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
      resetSubscriptionVisible: false,
      skipMesOnSubscriptionInfo: {
        numMes: 0,
        subscription: ''
      },
      skipMesOnSubscriptionRules: {
        subscription: [
          { required: true, message: 'Please select a subscription', trigger: 'change' }
        ]
      },
      skipMesOnSubscriptionVisible: false,
      skipAllMesOnSubscriptionVisible: false,
      setTopicDispatchRateInfo: {
        dispatchThrottlingRateInByte: 0,
        dispatchThrottlingRateInMsg: 0,
        ratePeriodInSecond: 0,
        relativeToPublishRate: false
      },
      setTopicDispatchRateRules: {
      },
      setTopicDispatchRateVisible: false,
      setTopicSubscriptionDispatchRateInfo: {
        dispatchThrottlingRateInByte: 0,
        dispatchThrottlingRateInMsg: 0,
        ratePeriodInSecond: 0,
        relativeToPublishRate: false
      },
      setTopicSubscriptionDispatchRateRules: {
      },
      setTopicSubscriptionDispatchRateVisible: false,
      deleteSubscriptionVisible: false,
      deleteSubscriptionInfo: {
        subscription: '',
        forceDelete: false
      },
      deleteSubscriptionRules: {
        subscription: [
          { required: true, message: 'Please select a subscription', trigger: 'change' }
        ]
      },
      confirmDeleteInfo: {
        forceDelete: false
      },
      confirmDeleteRules: {
      },
      confirmDeleteVisible: false
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
    },
    
    publishers() {
      if (this.stats) {
        return this._.map(this.stats.publishers, (infos) => ({ ...infos}))
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
      
      const topicOriginName = this.$route.params.tenant + '/' + this.$route.params.namespace + '/' + this.$route.params.topic.replace(/-partition-[0-9]$/, '');
      
      this.policies = {
        policies: {},
        stats: this.currentTopic.stats
      };
      
      // fetch policies information
      await Promise.all([
        this.$pulsar.fetchTopicSubscriptionDispatchRateConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicRetentionConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicPersistenceConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicTTLConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicMaxSubscriptionsConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicMaxProducersConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicMaxMessageSizeConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicInactivePoliciesConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicDelayedDeliveryConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicDeduplicationConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicCompationThresholdConfig(this.$route.params.persistent + '/' + topicOriginName, cluster),
        this.$pulsar.fetchTopicDispatchRateConfig(this.$route.params.persistent + '/' + topicOriginName, cluster)
      ]).then((values) => {
        this.policies.policies.subscriptionDispatchRate = values[0];
        this.policies.policies.retention = values[1];
        this.policies.policies.persistence = values[2];
        this.policies.policies.TTL = values[3];
        this.policies.policies.maxSubscription = values[4];
        this.policies.policies.maxProducer = values[5];
        this.policies.policies.maxMessageSize = values[6];
        this.policies.policies.inactivePolicies = values[7];
        this.policies.policies.delayedDelivery = values[8];
        this.policies.policies.deduplication = values[9];
        this.policies.policies.compationThreshold = values[10];
        this.policies.policies.dispatchRate = values[11];
      })
      
      if (this.policies.stats.publishers) {
        this.policies.stats.publishers = Object.assign({}, this.policies.stats.publishers)
      }
      
      this.metadata = await this.$pulsar.fetchTopicMetadata(this.$route.params.persistent + '/' + topicOriginName, cluster)
      // convert array property to object
      for(let obj in this.metadata.partitions) {
        this.metadata.partitions[obj].ledgers = Object.assign({}, this.metadata.partitions[obj].ledgers)
      }
      if (this.metadata.ledgers) {
        this.metadata.ledgers = Object.assign({}, this.metadata.ledgers)
      }
      
      this.loading = false
    },

    handleAction(action) {
      const topicOriginName = this.$route.params.tenant + '/' + this.$route.params.namespace + '/' + this.$route.params.topic.replace(/-partition-[0-9]$/, '');
      let self = this;
    
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
        case 'skipMesOnSubscription':
          this.skipMesOnSubscriptionVisible = true
          break
        case 'setTopicDispatchRate':
          this.$pulsar.fetchTopicDispatchRateConfig(this.$route.params.persistent + '/' + topicOriginName, this.currentTopic.cluster).then((info) => {
            if (info) {
              self.setTopicDispatchRateInfo = info
            }
            self.setTopicDispatchRateVisible = true
          })
          break
        case 'setTopicSubscriptionDispatchRate':
          this.$pulsar.fetchTopicSubscriptionDispatchRateConfig(this.$route.params.persistent + '/' + topicOriginName, this.currentTopic.cluster).then((info) => {
            if (info) {
              self.setTopicSubscriptionDispatchRateInfo = info
            }
            self.setTopicSubscriptionDispatchRateVisible = true
          })
          break
        case 'skipAllMesOnSubscription':
          this.skipAllMesOnSubscriptionVisible = true
          break
        case 'deleteSubscription':
          this.deleteSubscriptionVisible = true
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
                  message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
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
          this.publishedMessageJustAfterTimestamp = resp
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
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
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    createMissedPartitions() {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name.replace(/-partition-[0-9]+$/, '')
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
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    skipMesOnSubscription(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name
      this.$pulsar.skipMesOnSubscription(topicName, this.skipMesOnSubscriptionInfo.subscription, this.skipMesOnSubscriptionInfo.numMes, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Skip messages on the subscription successfully!'
          })
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    skipAllMesOnSubscription(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name
      this.$pulsar.skipAllMesOnSubscription(topicName, this.skipMesOnSubscriptionInfo.subscription, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Skip all messages on the subscription successfully!'
          })
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    setTopicDispatchRate(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name.replace(/-partition-[0-9]+$/, '')
      this.$pulsar.setTopicDispatchRate(topicName, this.setTopicDispatchRateInfo, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Set topic dispatch rate successfully!'
          })
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    deleteTopicDispatchRate(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name.replace(/-partition-[0-9]+$/, '')
      self = this
      this.$pulsar.deleteTopicDispatchRate(topicName, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Unset topic dispatch rate successfully!'
          })
          self.setTopicDispatchRateVisible = false
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    setTopicSubscriptionDispatchRate(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name.replace(/-partition-[0-9]+$/, '')
      this.$pulsar.setTopicSubscriptionDispatchRate(topicName, this.setTopicSubscriptionDispatchRateInfo, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Set subscription dispatch rate successfully!'
          })
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    deleteTopicSubscriptionDispatchRate(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name.replace(/-partition-[0-9]+$/, '')
      self = this
      this.$pulsar.deleteTopicSubscriptionDispatchRate(topicName, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Unset subscription dispatch rate successfully!'
          })
          self.setTopicSubscriptionDispatchRateVisible = false
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    deleteSubscription(formName) {
      const topicName = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name
      this.$pulsar.deleteTopicSubscription(topicName, this.deleteSubscriptionInfo.subscription, this.deleteSubscriptionInfo.forceDelete, this.currentTopic.cluster)
        .then((resp) => {
          this.$message({
            type: 'success',
            message: 'Delete the subscription successfully!'
          })
          this.reload()
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    deleteTopic(formName) {      
      const fullname = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name

      this.$pulsar.deleteTopic(fullname, this.currentTopic.cluster, this.confirmDeleteInfo.forceDelete)
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
    },
    
    truncateTopic() {      
      this.$confirm('This will truncate topic, data may be lost. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          const fullname = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name

          this.$pulsar.truncateTopic(fullname, this.currentTopic.cluster)
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Truncate completed'
              })
              this.reload()
            })
            .catch ((err) => {
              this.$message({
                type: 'error',
                message: 'Truncate error: ' + (err.response && err.response.data && err.response.data.reason || err)
              })
            })
        })
    },
    
    trimTopic() {
      const fullname = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name

      this.$pulsar.trimTopic(fullname, this.currentTopic.cluster)
        .then(() => {
          this.$message({
            type: 'success',
            message: 'Trim completed'
          })
          this.reload()
        })
        .catch ((err) => {
          this.$message({
            type: 'error',
            message: 'Trim error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    unloadTopic() {      
      this.$confirm('This will unload topic, topic will be assign to another broker. While assigning, the topic may be inaccessible. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
        .then(() => {
          const fullname = (this.currentTopic.persistent ? 'persistent' : 'non-persistent') + '/' + this.currentTopic.name

          this.$pulsar.unloadTopic(fullname, this.currentTopic.cluster)
            .then(() => {
              this.$message({
                type: 'success',
                message: 'Unload completed'
              })
            })
            .catch ((err) => {
              this.$message({
                type: 'error',
                message: 'Unload error: ' + (err.response && err.response.data && err.response.data.reason || err)
              })
            })
        })
    },
  },

  head() {
    return {
      title: 'Topic ' + this.$route.params.tenant + '/' + this.$route.params.namespace + '/' + this.$route.params.topic + ' - Pulsar Express'
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
