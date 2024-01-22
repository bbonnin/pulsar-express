<template>
  <div class="dataview">
    <breadcrumb :items="breadcrumbItems" />
    <loading v-if="loading" />
    <div v-else-if="functions.length > 0">
      <el-table
        :data="functions"
        style="width: 100%"
        height_="800"
        :default-sort = "{prop: 'status.numRunning', order: 'ascending'}">
        <el-table-column
          fixed
          label="Name"
          sortable>
          <template slot-scope="scope">
            <a :href="`/functions/${scope.row.cluster.name}/${scope.row.ns}/${scope.row.name}`">
              <el-button type="text" @click.native.prevent="showDetails(scope.row.id)" style="text-align: left">
                <p style="text-align: left; font-size: small; color: darkgray; margin-bottom: 4px">{{scope.row.ns}}/</p>
                {{scope.row.name}}
              </el-button>
            </a>
          </template>
        </el-table-column>
        <el-table-column
          prop="infos.runtime"
          label="Runtime"
          width="100">
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
              {{scope.row.status.instances.reduce((r, d) => r + d.status.numReceived, 0)}}/{{scope.row.status.instances.reduce((r, d) => r + d.status.numSuccessfullyProcessed, 0)}}
            </span>
            <span v-else>NaN</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Restarts"
          width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.status">
              {{scope.row.status.instances.reduce((r, d) => r + d.status.numRestarts, 0)}}
            </span>
            <span v-else>NaN</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Latency"
          width="100">
          <template slot-scope="scope">
            <span v-if="scope.row.status">
              {{scope.row.status.instances.reduce((r, d) => Math.round(Math.max(r, d.status.averageLatency) * 100) / 100, 0)}}
            </span>
            <span v-else>NaN</span>
          </template>
        </el-table-column>
        <el-table-column
          label="Last invocation">
          <template slot-scope="scope">
            <span v-if="scope.row.status">
              {{new Date(scope.row.status.instances.reduce((r, d) => Math.max(r, d.status.lastInvocationTime), 0)).toLocaleDateString('en-us', { month:"short", day:"numeric", hour:"numeric", minute:"numeric", second:"numeric"})}}
            </span>
            <span v-else>NaN</span>
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="Actions"
          width="200">
          <template slot-scope="scope">
            <el-button
              @click.native.prevent="showDetails(scope.row.id)"
              type="primary" plain round
              size="mini">
              Details
            </el-button>
            <el-button
              @click.native.prevent="deleteFunction(scope.row.id)"
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
        description="Cannot get any information about functions. Maybe you haven't defined any connections or the brokers are unreachable (or maybe it's time to drink a beer...)."
        show-icon>
      </el-alert>
    </div>
    <div class="button-bar">
      <el-button type="primary" @click="createFunctionVisible = true">Create</el-button>
      <el-button @click="reload()">Reload</el-button>
    </div>
    
    <el-dialog title="Create function" :visible.sync="createFunctionVisible">
      <el-form ref="createFunctionForm" :model="createFunctionInfo" label-width="200px">
        <el-form-item label="Type">
          <el-select v-model="createFunctionInfo.archive" placeholder="Please select a function type" @change="createFunctionTypeChanged()">
            <el-option label="Package URL" value="external://pkgUrl"></el-option>
            <el-option label="Upload JAR" value="external://jar"></el-option>
          </el-select>
        </el-form-item>
        <div v-if="createFunctionJarVisible">
          <el-form-item label="JAR">
            <input type="file" @change="selectJarFileChange"></input>
          </el-form-item>
        </div>
        <div v-if="createFunctionPkgUrlVisible">
          <el-form-item label="Package URL">
            <el-input v-model="createFunctionInfo.pkgUrl" placeholder="function://tenant/namespace/package_name@version or http:// or file://"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="JAR Classname">
          <el-input v-model="createFunctionInfo.className" placeholder="com.example.java.class.ExampleFunction"></el-input>
        </el-form-item>
        <el-form-item label="Name">
          <el-input v-model="createFunctionInfo.name" placeholder="example_function_name"></el-input>
        </el-form-item>
        <el-form-item label="Tenant">
          <el-input v-model="createFunctionInfo.tenant"></el-input>
        </el-form-item>
        <el-form-item label="Namespace">
          <el-input v-model="createFunctionInfo.namespace"></el-input>
        </el-form-item>
        <el-form-item label="Topics pattern">
          <el-input v-model="createFunctionInfo.topicsPattern" placeholder="public/default/topic"></el-input>
        </el-form-item>
        <el-form-item label="Parallelism">
          <el-input v-model.number="createFunctionInfo.parallelism"></el-input>
        </el-form-item>
        <el-form-item label="Processing guarantees">
          <el-select v-model="createFunctionInfo.processingGuarantees">
            <el-option label="ATLEAST ONCE" value="ATLEAST_ONCE"></el-option>
            <el-option label="ATMOST ONCE" value="ATMOST_ONCE"></el-option>
            <el-option label="EFFECTIVELY ONCE" value="EFFECTIVELY_ONCE"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Subscription position">
          <el-select v-model="createFunctionInfo.subscriptionPosition">
            <el-option label="Earliest" value="Earliest"></el-option>
            <el-option label="Latest" value="Latest"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="Configs">
          <el-input v-model="createFunctionInfo.configs" :autosize="{minRows: 1}" type="textarea" placeholder="{&quot;property&quot;: &quot;value&quot;}"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="createFunction('createFunctionForm')">Create function</el-button>
          <el-button @click="createFunctionVisible = false">Close</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { cellFormatFloat, cellFormatSimpleTopicName, getSimpleTopicName, shortClassName } from '@/services/utils'
import loading from '@/components/loading'
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'functions',

  layout: 'dataview',

  components: {
    loading, breadcrumb
  },

  data() {
    return {
      loading: false,
      functions: [],
      
      createFunctionVisible: false,
      createFunctionInfo: {
        archive: null,
        pkgUrl: null,
        jar: [],
        className: null,
        name: null,
        tenant: 'public',
        namespace: 'default',
        topicsPattern: null,
        parallelism: 1,
        processingGuarantees: 'ATLEAST_ONCE',
        subscriptionPosition: 'Latest',
        configs: null
      },
      
      createFunctionPkgUrlVisible: false,
      createFunctionJarVisible: false
    }
  },

  computed: {
    ...mapState('context', ['cluster']),

    breadcrumbItems() {
      return [
        { path: '/clusters', label: this.cluster ? 'Cluster ' + this.cluster.name : 'All clusters'},
        { label: 'Functions' }
      ]
    }
  },

  mounted() {
    this.reload()
  },

  methods: {
    cellFormatFloat,
    cellFormatSimpleTopicName,
    getSimpleTopicName,
    shortClassName,

    ...mapActions('context', ['setFunction', 'setFunctions']),

    multiTopic(row, column, cellValue, index) {
      let topics = ''

      return ''
    },

    showDetails(id) {
      const func = this.functions[id]
      this.$router.push({ path: '/functions/' + func.cluster.name + '/' + func.infos.tenant + '/' + func.infos.namespace + '/' + func.infos.name })
    },
    
    deleteFunction(id) {
      const func = this.functions[id]
      this.$pulsar.deleteFunction(func.infos.tenant + '/' + func.infos.namespace + '/' + func.infos.name, func.cluster)
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
            message: 'Delete error: ' + (err.response && err.response.data && err.response.data.reason || err)
          })
        })
    },

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
      
      const tenants = await this.$pulsar.fetchTenants(this.clusters)
      const namespaces = await this.$pulsar.fetchNamespaces(tenants)

      const functionsByNs = []
      
      for (const ns of namespaces) {
        try {
          const names = await this.$pulsar.fetchFunctions(ns.namespace, ns.cluster)

          if (names && names.length > 0) {
            functionsByNs.push({ cluster: ns.cluster, namespace: ns.namespace, names })
          }
        }
        catch (err) {
          console.error(err)
          /*
          this.$message({
            type: 'error',
            message: 'Fetch Functions ' + err
          })
          */
        }
      }

      this.functions = []
      
      for (const functions of functionsByNs) {
        for (const fctName of functions.names) {
          this.functions.push({
            id: this.functions.length,
            cluster: functions.cluster,
            ns: functions.namespace,
            name: fctName})
        }
      }
      
      const fctWithInfo = (ref, infos) => {
        return {
          ...ref,
          infos: infos
        }
      }

      this.functions = await Promise.all(
        this.functions.map(ref =>
          this.$pulsar.fetchFunction(ref.ns + '/' + ref.name, ref.cluster)
            .then((res) => fctWithInfo(ref, res))
            .catch((e) => {
              console.error(e);
              return fctWithInfo(ref, undefined);
            })
        )
      )
      
      const fctWithStatus = (ref, status) => {
        return {
          ...ref,
          status: status
        }
      }

      this.functions = await Promise.all(
        this.functions.map(ref =>
          this.$pulsar.fetchFunctionStatus(ref.ns + '/' + ref.name, ref.cluster)
            .then((res) => fctWithStatus(ref, res))
            .catch((e) => {
              console.error(e);
              return fctWithStatus(ref, undefined);
            })
        )
      )

      this.setFunctions(this.functions)

      this.loading = false
    },
    
    createFunction(formName) {
      var functionConfig = {
        topicsPattern: this.createFunctionInfo.topicsPattern,
        parallelism: this.createFunctionInfo.parallelism,
        processingGuarantees: this.createFunctionInfo.processingGuarantees,
        sourceSubscriptionPosition: this.createFunctionInfo.sourceSubscriptionPosition,
        runtime: "JAVA",
        className: this.createFunctionInfo.className
      }
      
      // merge other configs to functionConfig.configs object
      if (this.createFunctionInfo.configs) {
        otherConfigs = {}
        try {
          otherConfigs = JSON.parse(this.createFunctionInfo.configs);
        } catch (e) {
          this.$message({
            type: 'error',
            message: 'Can not parse other config, please make sure it is valid JSON: ' + e
          })
          return;
        }
        
        for (var prop in otherConfigs) {
          functionConfig.configs[prop] = otherConfigs[prop];
        }
      }
      
      const blob = new Blob([JSON.stringify(functionConfig)], { type: "application/json"});
      
      const formData = new FormData();
      formData.append("functionConfig", blob)
      if (this.createFunctionInfo.archive == "external://jar") {
        formData.append("data", this.createFunctionInfo.jar[0])
      }
      else if (this.createFunctionInfo.archive == "external://pkgUrl") {
        formData.append("url", this.createFunctionInfo.pkgUrl)
      }
      
      this.$pulsar.createFunction(this.createFunctionInfo.tenant + '/' + this.createFunctionInfo.namespace + '/' + this.createFunctionInfo.name, this.clusters[0], formData)
        .then (resp => {
          this.$message({
            type: 'success',
            message: 'Create new function successfully!'
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
    
    selectJarFileChange(e) {
      this.createFunctionInfo.jar = e.target.files;
    },
    
    createFunctionTypeChanged() {
      this.createFunctionPkgUrlVisible = false;
      this.createFunctionJarVisible = false;
    
      switch(this.createFunctionInfo.archive) {
        case 'external://pkgUrl':
          this.createFunctionPkgUrlVisible = true;
          break;
        case 'external://jar':
          this.createFunctionJarVisible = true;
          break;
      }
    }
  },

  head() {
    return {
      title: 'Functions - Pulsar Express'
    }
  }
}
</script>
