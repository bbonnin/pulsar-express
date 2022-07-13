<template>
  <div class="dataview">
    <h2 class="title">Overview</h2>
    <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="~/assets/clusters.png" width="32" />Clusters</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/clusters' })">{{ clusters.length }}</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="~/assets/brokers.png" width="32" />Brokers</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/brokers' })">{{ brokers.length }}</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="~/assets/topics.png" width="32" />Topics</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/topics' })">{{ topics.length }}</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="~/assets/brokers.png" width="32" />Workers</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/workers' })">{{ workers.length }}</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="~/assets/sinks.png" width="32" />Sinks</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/sinks' })">{{ sinks.length }}</el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'overview',

  layout: 'simple-dataview',

  data() {
    return {
      clusters: [],
      brokers: [],
      topics: [],
      workers: [],
      sinks: []
    }
  },

  computed: mapState('connections', ['connections']),

  mounted() {
    this.load()
  },

  methods: {
    async load() {
      await this.$store.dispatch('connections/fetchConnections')
      this.clusters = await this.$pulsar.fetchClusters(this.connections)
      this.brokers = await this.$pulsar.fetchBrokers(this.clusters)
      this.topics = await this.$pulsar.fetchTopics(this.clusters)
      this.workers = await this.$pulsar.fetchWorkers(this.clusters)
      this.sinks = await this.$pulsar.fetchSinks(this.clusters)
    }
  },

  head() {
    return {
      title: 'Overview - Pulsar Express'
    }
  }
}
</script>

<style scoped>
.title {
  color: #2c3e50;
  margin: 20px 0 50px;
}
.subtitle {
  font-weight: 300;
  color: #2c3e50;
  line-height: 1.8;
}
.big-number {
  font-size: 80px;
  padding: 20px;
  width: 100%;
}
img {
  float: left;
  margin-right: 20px;
}
</style>
