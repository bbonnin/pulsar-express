<template>
  <div class="dataview">
    <breadcrumb
      :items="[
        {
          path: '/clusters',
          label: cluster ? 'Cluster ' + cluster.name : 'All clusters',
        },
        { label: 'Sources' },
      ]"
    />
    <loading v-if="loading" />
    <div v-else-if="sources.length > 0">
      <el-table :data="sources" style="width: 100%">
        <el-table-column fixed label="Name" prop="source" sortable width="250">
          <template slot-scope="scope">
            <el-button
              type="text"
              @click.native.prevent="showDetails(scope.row.id)"
              >{{ scope.row.source }}</el-button
            >
          </template>
        </el-table-column>
        <el-table-column prop="cluster.name" label="Cluster"> </el-table-column>
        <el-table-column fixed="right" label="Actions" width="200">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row.id)"
              type="primary"
              plain
              round
              size="mini"
            >
              Details
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about sources. Maybe you haven't defined any connections or the brokers are unreachable."
        show-icon
      >
      </el-alert>
    </div>

    <div class="button-bar">
      <el-button @click="reload()">Reload</el-button>
    </div>
  </div>
</template>

<script>
import loading from "@/components/loading";
import breadcrumb from "@/components/breadcrumb";
import { mapState, mapActions } from "vuex";

export default {
  name: "sources",

  layout: "dataview",

  components: {
    loading,
    breadcrumb,
  },

  data() {
    return {
      sources: [],
      createVisible: false,
      clusters: [],
      loading: false,
    };
  },

  computed: mapState("context", ["cluster"]),

  mounted() {
    this.reload();
  },

  methods: {
    ...mapActions("context", ["setSource", "setSources"]),

    async reload() {
      this.loading = true;
      let connections = [];

      if (this.cluster) {
        connections.push(this.cluster.connection);
      } else {
        await this.$store.dispatch("connections/fetchConnections");
        connections = this.$store.state.connections.connections;
      }

      this.clusters = await this.$pulsar.fetchClusters(connections);

      this.sources = await this.$pulsar.fetchSources(this.clusters);

      this.sources = this.sources.map((ns, idx) => ({ ...ns, id: idx }));
      this.setSources(this.sources);

      this.loading = false;
    },

    showDetails(id) {
      this.setSource(id);
      this.$router.push({ path: "/sources/" + id });
    },
  },

  head() {
    return {
      title: "Sources - Pulsar Express",
    };
  },
};
</script>
