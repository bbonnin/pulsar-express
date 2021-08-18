<template>
  <div class="dataview">
    <div v-if="currentSource">
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
        description="It seems that this source does not exist..."
        show-icon
      >
      </el-alert>
    </div>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatBoolean } from "@/services/utils";
import breadcrumb from "@/components/breadcrumb";
import propertyview from "@/components/property-view";
import { mapState, mapActions } from "vuex";

export default {
  name: "source",

  layout: "dataview",

  components: {
    breadcrumb,
    propertyview,
  },

  data() {
    return {
      policies: [],
    };
  },

  computed: {
    ...mapState("context", ["source", "sources"]),

    breadcrumbItems() {
      return [
        {
          path: "/clusters",
          label: "Cluster " + this.currentSource.cluster.name,
        },
        { path: "/sources", label: "Sources" },
        { label: this.currentSource.source },
      ];
    },

    currentSource() {
      if (this.sources && this.sources.length > this.source) {
        return this.sources[this.source];
      }

      return null;
    },
  },

  mounted() {
    this.reload();
  },

  methods: {
    cellFormatFloat,
    cellFormatBoolean,

    async reload() {
      this.policies = await this.$pulsar.fetchSource(
        this.currentSource.source,
        this.currentSource.cluster,
        this.currentSource.ns
      );
    },
  },

  head() {
    return {
      title: "pulsar-express - source",
    };
  },
};
</script>

<style scoped>
h3 {
  margin: 50px 0 20px;
  color: #1f2f3d;
}
</style>
