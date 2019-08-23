<template>
  <div class="dataview">
    <div v-if="currentNamespace">
      
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
        description="It seems that this namespace does not exist..."
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
  name: 'namespace',

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
    ...mapState('context', ['namespace', 'namespaces']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: 'Cluster ' + this.currentNamespace.cluster.name },
        { path: '/namespaces', label: 'Namespaces' },
        { label: this.currentNamespace.namespace }
      ]
    },

    currentNamespace() {
      if (this.namespaces && this.namespaces.length > this.namespace) {
        return this.namespaces[this.namespace]
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
      this.policies = await this.$pulsar.fetchNamespace(this.currentNamespace.namespace, this.currentNamespace.cluster)
    }
  },

  head() {
    return {
      title: 'pulsar-express - namespace'
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
