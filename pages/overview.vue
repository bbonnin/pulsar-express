<template>
  <div class="dataview">
    <h2 class="title">Overview</h2>
    <el-row :gutter="12">
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="/clusters.png" width="32" />Clusters</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/clusters' })">{{ clusters.length }}</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="/brokers.png" width="32" />Brokers</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/brokers' })">{{ brokers.length }}</el-button>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <h3 class="subtitle"><img src="/topics.png" width="32" />Topics</h3>
          <el-button type="text" class="big-number" @click.native.prevent="$router.push({ path: '/topics' })">{{ topics.length }}</el-button>
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
      topics: []
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
    }
  },

  head() {
    return {
      title: 'pulsar-express - overview'
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
