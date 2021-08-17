<template>
  <div class="dataview">
    <div v-if="currentSink">
      
      <breadcrumb :items="breadcrumbItems" />
      
      <h3>Properties</h3>

      <propertyview :props="policies"></propertyview>

      <div class="button-bar">
        <el-button @click="reload()">Reload</el-button>
      </div>
    </div>
    <div v-else>
      <el-alert
        title="Oops!"
        type="error"
        description="It seems that this sink does not exist..."
        show-icon>
      </el-alert>
    </div>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatBoolean } from '@/services/utils'
import breadcrumb from '@/components/breadcrumb'
import propertyview from '@/components/property-view'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'sink',

  layout: 'dataview',

  components: {
    breadcrumb, propertyview
  },

  data() {
    return {
      policies: []
    }
  },

  computed: {
    ...mapState('context', ['sink', 'sinks']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: 'Cluster ' + this.currentSink.cluster.name, },
        { path: '/sinks', label: 'Sinks' },
        { label: this.currentSink.sink }
      ]
    },

    currentSink() {
      if (this.sinks && this.sinks.length > this.sink) {
        return this.sinks[this.sink]
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

    async reload() {
      this.policies = await this.$pulsar.fetchSink(this.currentSink.sink, this.currentSink.cluster, this.currentSink.ns)
    }
  },

  head() {
    return {
      title: 'pulsar-express - sink'
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
