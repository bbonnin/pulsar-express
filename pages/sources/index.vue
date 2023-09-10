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
      <el-button type="primary" @click="createSourceVisible = true">Create</el-button>
      <el-button @click="reload()">Reload</el-button>
    </div>
    
    <el-dialog title="Create a source" :visible.sync="createSourceVisible">
      <el-form ref="createSourceForm" :model="createSourceInfo" label-width="200px">
        <el-form-item label="Type">
          <el-select v-model="createSourceInfo.archive" placeholder="Please select a source type" @change="createSourceTypeChanged()">
            <el-option label="File" value="builtin://file"></el-option>
            <el-option label="Netty" value="builtin://netty"></el-option>
            <el-option label="RabbitMQ" value="builtin://rabbitmq"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="createSourceInfo.name"></el-input>
        </el-form-item>
        <el-form-item label="Tenant">
          <el-input v-model="createSourceInfo.tenant"></el-input>
        </el-form-item>
        <el-form-item label="Namespace">
          <el-input v-model="createSourceInfo.namespace"></el-input>
        </el-form-item>
        <el-form-item label="Topic name">
          <el-input v-model="createSourceInfo.topicName"></el-input>
        </el-form-item>
        <el-form-item label="Parallelism">
          <el-input v-model.number="createSourceInfo.parallelism"></el-input>
        </el-form-item>
        <el-form-item label="Processing guarantees">
          <el-select v-model="createSourceInfo.processingGuarantees">
            <el-option label="ATLEAST ONCE" value="ATLEAST_ONCE"></el-option>
            <el-option label="ATMOST ONCE" value="ATMOST_ONCE"></el-option>
            <el-option label="EFFECTIVELY ONCE" value="EFFECTIVELY_ONCE"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="createSourceNettyVisible">
          <el-form-item label="Netty type">
            <el-select v-model="createSourceInfo.nettyType">
              <el-option label="TCP" value="tcp"></el-option>
              <el-option label="UDP" value="udp"></el-option>
              <el-option label="HTTP" value="http"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="Netty host">
            <el-input v-model="createSourceInfo.nettyHost"></el-input>
          </el-form-item>
          <el-form-item label="Netty port">
            <el-input v-model.number="createSourceInfo.nettyPort"></el-input>
          </el-form-item>
          <el-form-item label="Number of thread">
            <el-input v-model.number="createSourceInfo.nettyNumberOfThread"></el-input>
          </el-form-item>
        </div>
        <div v-if="createSourceFileVisible">
          <el-form-item label="Input directory">
            <el-input v-model="createSourceInfo.fileInputDir"></el-input>
          </el-form-item>
          <el-form-item label="Recursive?">
            <el-checkbox v-model.boolean="createSourceInfo.fileRecurse"></el-checkbox>
          </el-form-item>
          <el-form-item label="Keep file?">
            <el-checkbox v-model.boolean="createSourceInfo.fileKeepFile"></el-checkbox>
          </el-form-item>
          <el-form-item label="File filter">
            <el-input v-model="createSourceInfo.fileFileFilter"></el-input>
          </el-form-item>
          <el-form-item label="Path filter">
            <el-input v-model="createSourceInfo.filePathFilter"></el-input>
          </el-form-item>
          <el-form-item label="Minimum file age">
            <el-input v-model.number="createSourceInfo.fileMinimumFileAge"></el-input>
          </el-form-item>
          <el-form-item label="Maximum file age">
            <el-input v-model.number="createSourceInfo.fileMaximumFileAge"></el-input>
          </el-form-item>
          <el-form-item label="Minimum size">
            <el-input v-model.number="createSourceInfo.fileMinimumSize"></el-input>
          </el-form-item>
          <el-form-item label="Maximum size">
            <el-input v-model.number="createSourceInfo.fileMaximumSize"></el-input>
          </el-form-item>
          <el-form-item label="Ignore hidden file?">
            <el-checkbox v-model.boolean="createSourceInfo.fileIgnoreHiddenFile"></el-checkbox>
          </el-form-item>
          <el-form-item label="Polling interval">
            <el-input v-model.number="createSourceInfo.filePollingInterval"></el-input>
          </el-form-item>
          <el-form-item label="Num workers">
            <el-input v-model.number="createSourceInfo.fileNumWorkers"></el-input>
          </el-form-item>
          <el-form-item label="Processed file suffix">
            <el-input v-model="createSourceInfo.fileProcessedFileSuffix"></el-input>
          </el-form-item>
        </div>
        <div v-if="createSourceRabbitVisible">
          <el-form-item label="Connection Name">
            <el-input v-model="createSourceInfo.rabbitConnectionName"></el-input>
          </el-form-item>
          <el-form-item label="Host">
            <el-input v-model="createSourceInfo.rabbitHost"></el-input>
          </el-form-item>
          <el-form-item label="Port">
            <el-input v-model.number="createSourceInfo.rabbitPort"></el-input>
          </el-form-item>
          <el-form-item label="Virtual host">
            <el-input v-model="createSourceInfo.rabbitVirtualHost"></el-input>
          </el-form-item>
          <el-form-item label="Queue name">
            <el-input v-model="createSourceInfo.rabbitQueueName"></el-input>
          </el-form-item>
          <el-form-item label="Passive?">
            <el-checkbox v-model.boolean="createSourceInfo.rabbitPassive"></el-checkbox>
          </el-form-item>
        </div>
        <div v-if="createSourceUserPassVisible">
          <el-form-item label="Username">
            <el-input v-model="createSourceInfo.username"></el-input>
          </el-form-item>
          <el-form-item label="Password">
            <el-input v-model="createSourceInfo.password"></el-input>
          </el-form-item>
        </div>
        
        <el-form-item>
          <el-button type="primary" @click="createSource('createSourceForm')">Create source</el-button>
          <el-button @click="createSourceVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
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
      
      createSourceVisible: false,
      createSourceInfo: {
        archive: null,
        name: null,
        tenant: 'public',
        namespace: 'default',
        topicsPattern: null,
        parallelism: 1,
        processingGuarantees: 'ATLEAST_ONCE',
        
        nettyType: 'http',
        nettyHost: '127.0.0.1',
        nettyPort: 10999,
        nettyNumberOfThread: 1,
        
        rabbitConnectionName: '',
        rabbitHost: '',
        rabbitPort: 5672,
        rabbitVirtualHost: '/',
        rabbitQueueName: '',
        rabbitPassive: false,
        
        fileInputDir: '',
        fileRecurse: true,
        fileKeepFile: false,
        fileFileFilter: '\\\\.*',
        filePathFilter: null,
        fileMinimumFileAge: 0,
        fileMaximumFileAge: Number.MAX_SAFE_INTEGER,
        fileMinimumSize: 1,
        fileMaximumSize: Number.MAX_SAFE_INTEGER,
        fileIgnoreHiddenFile: true,
        filePollingInterval: 10000,
        fileNumWorkers: 1,
        fileProcessedFileSuffix: null,
        
        username: '',
        password: ''
      },
      createSourceNettyVisible: false,
      createSourceFileVisible: false,
      createSourceUserPassVisible: false,
      createSourceRabbitVisible: false
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
    
    createSource(formName) {
      var sourceConfig = {
        archive: this.createSourceInfo.archive,
        topicName: this.createSourceInfo.topicName,
        parallelism: this.createSourceInfo.parallelism,
        processingGuarantees: this.createSourceInfo.processingGuarantees
      }
      
      switch(this.createSourceInfo.archive) {
        case 'builtin://netty':
          sourceConfig.configs = {
            type: this.createSourceInfo.nettyType,
            host: this.createSourceInfo.nettyHost,
            port: this.createSourceInfo.nettyPort,
            numberOfThreads: this.createSourceInfo.numberOfThreads
          };
          break;
        case 'builtin://file':
          sourceConfig.configs = {
            inputDirectory: this.createSourceInfo.fileInputDir,
            recurse: this.createSourceInfo.recurse,
            keepFile: this.createSourceInfo.keepFile,
            fileFilter: this.createSourceInfo.fileFileFilter,
            pathFilter: this.createSourceInfo.filePathFilter,
            minimumFileAge: this.createSourceInfo.fileMinimumFileAge,
            maximumFileAge: this.createSourceInfo.fileMaximumFileAge,
            minimumSize: this.createSourceInfo.fileMinimumSize,
            maximumSize: this.createSourceInfo.fileMaximumSize,
            ignoreHiddenFile: this.createSourceInfo.fileIgnoreHiddenFile,
            pollingInterval: this.createSourceInfo.filePollingInterval,
            numWorkers: this.createSourceInfo.fileNumWorkers,
            processedFileSuffix: this.createSourceInfo.fileProcessedFileSuffix
          };
          break;
        case 'builtin://rabbitmq':
          sourceConfig.configs = {
            connectionName: this.createSourceInfo.rabbitConnectionName,
            host: this.createSourceInfo.rabbitHost,
            port: this.createSourceInfo.rabbitPort,
            virtualHost: this.createSourceInfo.rabbitVirtualHost,
            username: this.createSourceInfo.username,
            password: this.createSourceInfo.password,
            queueName: this.createSourceInfo.rabbitQueueName,
            passive: this.createSourceInfo.rabbitPassive
          };
          break;
      }
      
      const blob = new Blob([JSON.stringify(sourceConfig)], { type: "application/json"});
      
      const formData = new FormData();
      formData.append("sourceConfig", blob)
      
      this.$pulsar.createSource(this.createSourceInfo.tenant + '/' + this.createSourceInfo.namespace + '/' + this.createSourceInfo.name, this.clusters[0], formData)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Create new sink successfully!'
          })
          this.reload()
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Create error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },
    
    createSourceTypeChanged() {
      this.createSourceFileVisible = false;
      this.createSourceRabbitVisible = false;
      this.createSourceNettyVisible = false;
    
      switch(this.createSourceInfo.archive) {
        case 'builtin://file':
          this.createSourceFileVisible = true;
          break;
        case 'builtin://netty':
          this.createSourceNettyVisible = true;
          break;
        case 'builtin://rabbitmq':
          this.createSourceRabbitVisible = true;
          break;
      }
    }
  },

  head() {
    return {
      title: "Sources - Pulsar Express",
    };
  },
};
</script>
