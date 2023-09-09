<template>
  <div class="dataview">
    <breadcrumb :items="[ { path: '/clusters', label: cluster ? 'Cluster ' + cluster.name : 'All clusters' }, { label: 'Sinks' } ]" />
    <loading v-if="loading" />
    <div v-else-if="sinks.length > 0">
      <el-table
        :data="sinks"
        style="width: 100%"
        :default-sort = "{prop: 'status.numRunning', order: 'ascending'}">
        <el-table-column
          fixed
          label="Name"
          prop="sink"
          sortable>
          <template slot-scope="scope">
            <a :href="`/sinks/${scope.row.cluster.name}/${scope.row.ns.namespace}/${scope.row.sink}`">
              <el-button type="text" @click.native.prevent="showDetails(scope.row)" style="text-align: left">
                <p style="text-align: left; font-size: small; color: darkgray; margin-bottom: 4px">{{scope.row.ns.namespace}}/</p>
                {{ scope.row.sink }}
              </el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column
          prop="status.numRunning"
          label="Running"
          sortable
          width="100">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status" 
                :type="scope.row.status.numRunning >= scope.row.status.numInstances ? 'success' : scope.row.status.numRunning <= 0 ? 'danger' : 'warning'"
                disable-transitions>
                {{scope.row.status.numRunning}}/{{scope.row.status.numInstances}}
            </el-tag>
            <el-tag v-else  
                type="warning"
                disable-transitions>
                NaN
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="Read/Written">
          <template slot-scope="scope">
            <span v-if="scope.row.status">
              {{scope.row.status.instances.reduce((r, d) => r + d.status.numReadFromPulsar, 0)}}/{{scope.row.status.instances.reduce((r, d) => r + d.status.numWrittenToSink, 0)}}
            </span>
            <span v-else>NaN</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Restarts">
          <template slot-scope="scope">
            <span v-if="scope.row.status">
              {{scope.row.status.instances.reduce((r, d) => r + d.status.numRestarts, 0)}}
            </span>
            <span v-else>NaN</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Last received">
          <template slot-scope="scope">
            <span v-if="scope.row.status">
              {{new Date(scope.row.status.instances.reduce((r, d) => Math.max(r, d.status.lastReceivedTime), 0)).toLocaleDateString('en-us', { month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"})}}
            </span>
            <span v-else>NaN</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="cluster.name"
          label="Cluster">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="200">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row)"
              type="primary" plain round
              size="mini">
              Details
            </el-button>
            <el-button
              @click.native.prevent="deleteSink(scope.row)"
              type="danger" plain round
              size="mini">
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Bad news"
        type="warning"
        description="Cannot get any information about sinks. Maybe you haven't defined any connections or the brokers are unreachable."
        show-icon>
      </el-alert>
    </div>
    
    <div class="button-bar">
      <el-button type="primary" @click="createSinkVisible = true">Create</el-button>
      <el-button @click="reload()">Reload</el-button>
    </div>
    
    <el-dialog title="Create sink" :visible.sync="createSinkVisible">
      <el-form ref="createSinkForm" :model="createSinkInfo" label-width="200px">
        <el-form-item label="Type">
          <el-select v-model="createSinkInfo.archive" placeholder="Please select a sink type" @change="createSinkTypeChanged()">
            <el-option label="ElasticSearch" value="builtin://elastic_search"></el-option>
            <el-option label="SQLite (JDBC)" value="builtin://jdbc-sqlite"></el-option>
            <el-option label="PostgreSQL (JDBC)" value="builtin://jdbc-postgres"></el-option>
            <el-option label="MariaDB (JDBC)" value="builtin://jdbc-mariadb"></el-option>
            <el-option label="ClickHouse (JDBC)" value="builtin://jdbc-clickhouse"></el-option>
            <el-option label="RabbitMQ" value="builtin://rabbitmq"></el-option>
            <el-option label="Cassandra" value="builtin://cassandra"></el-option>
            <el-option label="Upload JAR" value="external://jar"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="createSinkJarVisible">
          <el-form-item label="JAR">
            <input type="file" @change="selectJarFileChange"></input>
          </el-form-item>
          <el-form-item label="JAR Classname">
            <el-input v-model="createSinkInfo.className"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="Name">
          <el-input v-model="createSinkInfo.name"></el-input>
        </el-form-item>
        <el-form-item label="Tenant">
          <el-input v-model="createSinkInfo.tenant"></el-input>
        </el-form-item>
        <el-form-item label="Namespace">
          <el-input v-model="createSinkInfo.namespace"></el-input>
        </el-form-item>
        <el-form-item label="Topics pattern">
          <el-input v-model="createSinkInfo.topicsPattern"></el-input>
        </el-form-item>
        <el-form-item label="Parallelism">
          <el-input v-model.number="createSinkInfo.parallelism"></el-input>
        </el-form-item>
        <el-form-item label="Processing guarantees">
          <el-select v-model="createSinkInfo.processingGuarantees">
            <el-option label="ATLEAST ONCE" value="ATLEAST_ONCE"></el-option>
            <el-option label="ATMOST ONCE" value="ATMOST_ONCE"></el-option>
            <el-option label="EFFECTIVELY ONCE" value="EFFECTIVELY_ONCE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Source subscription position">
          <el-select v-model="createSinkInfo.sourceSubscriptionPosition">
            <el-option label="Earliest" value="Earliest"></el-option>
            <el-option label="Latest" value="Latest"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="createSinkESVisible">
          <el-form-item label="ElasticSearch URL">
            <el-input v-model="createSinkInfo.esUrl"></el-input>
          </el-form-item>
          <el-form-item label="ES Index Name">
            <el-input v-model="createSinkInfo.esIndexName"></el-input>
          </el-form-item>
          <el-form-item label="ES Create Index If Needed?">
            <el-checkbox v-model.boolean="createSinkInfo.esCreateIndexIfNeeded"></el-checkbox>
          </el-form-item>
        </div>
        <div v-if="createSinkJDBCVisible">
          <el-form-item label="JDBC URL">
            <el-input v-model="createSinkInfo.jdbcUrl"></el-input>
          </el-form-item>
          <el-form-item label="JDBC table name">
            <el-input v-model="createSinkInfo.jdbcTableName"></el-input>
          </el-form-item>
        </div>
        <div v-if="createSinkRabbitVisible">
          <el-form-item label="Connection Name">
            <el-input v-model="createSinkInfo.rabbitConnectionName"></el-input>
          </el-form-item>
          <el-form-item label="Host">
            <el-input v-model="createSinkInfo.rabbitHost"></el-input>
          </el-form-item>
          <el-form-item label="Virtual host">
            <el-input v-model="createSinkInfo.rabbitVirtualHost"></el-input>
          </el-form-item>
          <el-form-item label="Exchange name">
            <el-input v-model="createSinkInfo.rabbitExchangeName"></el-input>
          </el-form-item>
          <el-form-item label="Exchange type">
            <el-input v-model="createSinkInfo.rabbitExchangeType"></el-input>
          </el-form-item>
          <el-form-item label="Routing key">
            <el-input v-model="createSinkInfo.rabbitRoutingKey"></el-input>
          </el-form-item>
        </div>
        <div v-if="createSinkCassandraVisible">
          <el-form-item label="Roots">
            <el-input v-model="createSinkInfo.cassandraRoots"></el-input>
          </el-form-item>
          <el-form-item label="Keyspace">
            <el-input v-model="createSinkInfo.cassandraKeyspace"></el-input>
          </el-form-item>
          <el-form-item label="Keyname">
            <el-input v-model="createSinkInfo.cassandraKeyname"></el-input>
          </el-form-item>
          <el-form-item label="Column family">
            <el-input v-model="createSinkInfo.cassandraColumnFamily"></el-input>
          </el-form-item>
          <el-form-item label="Column name">
            <el-input v-model="createSinkInfo.cassandraColumnName"></el-input>
          </el-form-item>
        </div>
        <div v-if="createSinkUserPassVisible">
          <el-form-item label="Username">
            <el-input v-model="createSinkInfo.username"></el-input>
          </el-form-item>
          <el-form-item label="Password">
            <el-input v-model="createSinkInfo.password"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="Other configs">
          <el-input v-model="createSinkInfo.configs" :autosize="{minRows: 1}" type="textarea" placeholder="{&quot;property&quot;: &quot;value&quot;}"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="createSink('createSinkForm')">Create sink</el-button>
          <el-button @click="createSinkVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'sinks',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      sinks: [],
      createVisible: false,
      clusters: [],
      loading: false,
      createSinkVisible: false,
      createSinkInfo: {
        archive: null,
        jar: [],
        className: null,
        name: null,
        tenant: 'public',
        namespace: 'default',
        topicsPattern: null,
        parallelism: 1,
        processingGuarantees: 'ATLEAST_ONCE',
        sourceSubscriptionPosition: 'Latest',
        esUrl: '',
        esIndexName: '',
        esCreateIndexIfNeeded: false,
        configs: null,
        
        jdbcUrl: '',
        jdbcTableName: '',
        username: '',
        password: ''
      },
      createSinkESVisible: false,
      createSinkJDBCVisible: false,
      createSinkUserPassVisible: false,
      createSinkRabbitVisible: false,
      createSinkCassandraVisible: false
    }
  },

  computed: mapState('context', ['cluster']),

  mounted() {
    this.reload()
  },

  methods: {
    ...mapActions('context', ['setSink', 'setSinks']),

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

      this.sinks = await this.$pulsar.fetchSinks(this.clusters)
      
      const sinkWithStatus = (ref, status) => {
        return {
          ...ref,
          status: status
        }
      }

      this.sinks = await Promise.all(
        this.sinks.map(ref =>
          this.$pulsar.fetchSinkStatus(ref.sink, ref.cluster, ref.ns)
            .then((res) => sinkWithStatus(ref, res))
            .catch((e) => {
              console.error(e);
              return sinkWithStatus(ref, undefined);
            })
        )
      )
      
      this.setSinks(this.sinks)

      this.loading = false
    },

    showDetails(ref) {
      this.$router.push({ path: '/sinks/' + ref.cluster.name + '/' + ref.ns.namespace + '/' + ref.sink })
    },
    
    deleteSink(ref) {
      this.$pulsar.deleteSink(ref.sink, ref.cluster, ref.ns)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Deleted'
          })
          this.reload()
        })
        .catch (err => {
          this.$message({
            type: 'error',
            message: 'Delete error: ' + err
          })
        })
    },
    
    createSink(formName) {
      var sinkConfig = {
        topicsPattern: this.createSinkInfo.topicsPattern,
        parallelism: this.createSinkInfo.parallelism,
        processingGuarantees: this.createSinkInfo.processingGuarantees,
        sourceSubscriptionPosition: this.createSinkInfo.sourceSubscriptionPosition
      }
      
      switch(this.createSinkInfo.archive) {
        case 'builtin://elastic_search':
          sinkConfig.archive = this.createSinkInfo.archive;
          sinkConfig.configs = {
            elasticSearchUrl: this.createSinkInfo.esUrl,
            indexName: this.createSinkInfo.esIndexName,
            createIndexIfNeeded: this.createSinkInfo.esCreateIndexIfNeeded
          };
          break;
        case 'builtin://jdbc-sqlite':
          sinkConfig.archive = this.createSinkInfo.archive;
          sinkConfig.configs = {
            jdbcUrl: this.createSinkInfo.jdbcUrl,
            tableName: this.createSinkInfo.jdbcTableName
          };
        case 'builtin://jdbc-postgres':
        case 'builtin://jdbc-mariadb':
        case 'builtin://jdbc-clickhouse':
          sinkConfig.archive = this.createSinkInfo.archive;
          sinkConfig.configs = {
            jdbcUrl: this.createSinkInfo.jdbcUrl,
            tableName: this.createSinkInfo.jdbcTableName,
            userName: this.createSinkInfo.username,
            password: this.createSinkInfo.password
          };
          break;
        case 'builtin://rabbitmq':
          sinkConfig.archive = this.createSinkInfo.archive;
          sinkConfig.configs = {
            connectionName: this.createSinkInfo.rabbitConnectionName,
            host: this.createSinkInfo.rabbitHost,
            virtualHost: this.createSinkInfo.rabbitVirtualHost,
            username: this.createSinkInfo.username,
            password: this.createSinkInfo.password,
            exchangeName: this.createSinkInfo.rabbitExchangeName,
            exchangeType: this.createSinkInfo.rabbitExchangeType,
            routingKey: this.createSinkInfo.rabbitRoutingKey
          };
          break;
        case 'builtin://cassandra':
          sinkConfig.archive = this.createSinkInfo.archive;
          sinkConfig.configs = {
            roots: this.createSinkInfo.cassandraRoots,
            keyspace: this.createSinkInfo.cassandraKeyspace,
            columnFamily: this.createSinkInfo.cassandraColumnFamily,
            keyname: this.createSinkInfo.cassandraKeyname,
            columnName: this.createSinkInfo.cassandraColumnName
          };
          break;
        case 'external://jar':
          sinkConfig.className = this.createSinkInfo.className;
          break;
      }
      
      // merge other configs to sinkConfig.configs object
      if (this.createSinkInfo.configs) {
        otherConfigs = {}
        try {
          otherConfigs = JSON.parse(this.createSinkInfo.configs);
        } catch (e) {
          this.$message({
            type: 'error',
            message: 'Can not parse other config, please make sure it is valid JSON: ' + e
          })
          return;
        }
        
        for (var prop in otherConfigs) {
          sinkConfig.configs[prop] = otherConfigs[prop];
        }
      }
      
      console.log(sinkConfig);
      
      const blob = new Blob([JSON.stringify(sinkConfig)], { type: "application/json"});
      
      const formData = new FormData();
      formData.append("sinkConfig", blob)
      
      if (this.createSinkInfo.archive == "external://jar") {
        formData.append("data", this.createSinkInfo.jar[0])
      }
      
      this.$pulsar.createSink(this.createSinkInfo.tenant + '/' + this.createSinkInfo.namespace + '/' + this.createSinkInfo.name, this.clusters[0], formData)
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
            message: 'Create error: ' + err
          })
        })
    },
    
    createSinkTypeChanged() {
      this.createSinkESVisible = false;
      this.createSinkJDBCVisible = false;
      this.createSinkUserPassVisible = false;
      this.createSinkRabbitVisible = false;
      this.createSinkCassandraVisible = false;
      this.createSinkJarVisible = false;
    
      switch(this.createSinkInfo.archive) {
        case 'builtin://elastic_search':
          this.createSinkESVisible = true;
          break;
        case 'builtin://jdbc-sqlite':
          this.createSinkJDBCVisible = true;
          break;
        case 'builtin://jdbc-postgres':
        case 'builtin://jdbc-mariadb':
        case 'builtin://jdbc-clickhouse':
          this.createSinkJDBCVisible = true;
          this.createSinkUserPassVisible = true;
          break;
        case 'builtin://rabbitmq':
          this.createSinkRabbitVisible = true;
          this.createSinkUserPassVisible = true;
          break;
        case 'builtin://cassandra':
          this.createSinkCassandraVisible = true;
          break;
        case 'external://jar':
          this.createSinkJarVisible = true;
          break;
      }
    },
    
    selectJarFileChange(e) {
      this.createSinkInfo.jar = e.target.files;
    }
  },

  head() {
    return {
      title: 'Sinks - Pulsar Express'
    }
  }
}
</script>
