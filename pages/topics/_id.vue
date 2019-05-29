<template>
  <div class="dataview" v-loading="loading">
    <div v-if="currentTopic" v-loading="loading">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/overview' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/clusters' }">{{this.currentTopic.cluster.name}}</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/topics' }">Topics</el-breadcrumb-item>
        <el-breadcrumb-item>{{ fullname }}</el-breadcrumb-item>
      </el-breadcrumb>
      
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
          label="Storage size (bytes)">
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

    
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatDateSince } from '@/services/utils'
import loading from '@/components/loading'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'topic',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      loading: false,
      stats: null
    }
  },

  computed: {
    ...mapState('context', ['topic', 'topics']),

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
    cellFormatDateSince,

    async reload() {
      this.loading = true
      const persist = this.currentTopic.persistent ? "persistent" : "non-persistent"
      this.stats = await this.$pulsar.fetchTopicStats(persist + '/' + this.currentTopic.name, this.currentTopic.cluster)
      this.loading = false
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
