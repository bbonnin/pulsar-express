<template>
  <div>
    <div class="dataview">
      <breadcrumb :items="[ { label: 'Connections' } ]" />
      <div v-if="connections && connections.length > 0">
        <el-table
          :data="connections"
          style="width: 100%">
          <el-table-column
            fixed
            prop="name"
            label="Name"
            width="300">
          </el-table-column>
          <el-table-column
            prop="url"
            label="API URL">
          </el-table-column>
          <el-table-column
            prop="fctWorkerUrl"
            label="Function worker URL">
          </el-table-column>
          <el-table-column
            fixed="right"
            label="Actions"
            width="200">
            <template slot-scope="scope">
              <el-button
                v-if="!scope.row.serverConfig"
                @click.native.prevent="openConnection(scope.$index)"
                type="primary" plain round
                size="mini">
                Edit
              </el-button>
              <el-button
                v-if="!scope.row.serverConfig"
                @click.native.prevent="deleteConnection(scope.$index)"
                type="danger" plain round
                size="mini">
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="button-bar">
        <el-button type="primary" @click="openConnection(-1)">Add a connection</el-button>
      </div>
    </div>

    <el-dialog :title="upsertConnectionId < 0 ? 'Add a connection' : 'Update a connection'" :visible.sync="upsertConnectionVisible">
      <el-form ref="connectionForm" :model="connection" :rules="connectionRules" label-width="200px">
        <el-form-item label="Connection name" prop="name">
          <el-input v-model="connection.name"></el-input>
        </el-form-item>
        <el-form-item label="Pulsar API url" prop="url">
          <el-input v-model="connection.url"></el-input>
        </el-form-item>
        <el-form-item label="Function Worker API url" prop="fctWorkerUrl">
          <el-input v-model="connection.fctWorkerUrl"></el-input>
        </el-form-item>
        <el-form-item label="Token" prop="token">
          <el-input v-model="connection.token"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="upsertConnection('connectionForm')">{{ upsertConnectionId < 0 ? 'Create' : 'Update' }}</el-button>
          <el-button @click="upsertConnectionId = undefined">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import breadcrumb from '@/components/breadcrumb'
import { mapState, mapActions } from 'vuex'

const defaultConnection = {
  name: 'My local connection',
  url: 'http://localhost:8080',
  fctWorkerUrl: '',
  token: ''
}

export default {
  name: 'connections',

  layout: 'dataview',

  components: {
    breadcrumb
  },

  data() {
    return {
      upsertConnectionId: undefined,
      withSecurity: false,
      connection: defaultConnection,
      connectionRules: {
        name: [
          { required: true, message: 'Please set a connection name', trigger: 'blur' }
        ],
        url: [
          { required: true, message: 'Please set the Pulsar URL', trigger: 'blur' },
          { pattern: /https?:\/\//, message: 'URL must start with http(s)://', trigger: 'blur' }
        ],
        fctWorkerUrl: [
          { required: false, trigger: 'blur' },
          { pattern: /https?:\/\//, message: 'URL must start with http(s)://', trigger: 'blur' }
        ]
      }
    }
  },

  computed: {
    ...mapState('connections', ['connections']),

    upsertConnectionVisible: {
      get() {
        return this.upsertConnectionId >= -1
      },
      set() {
        this.upsertConnectionId = undefined
      }
    }
  },

  mounted() {
    this.$store.dispatch('connections/fetchConnections')
  },

  methods: {
    openConnection(idx) {
      this.upsertConnectionId = idx
      this.connection = idx === -1 ? defaultConnection : this._.clone(this.connections[idx])
    },

    upsertConnection(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.connection.token = this.connection.token.trim()

          if (this.upsertConnectionId > -1) {
            this.updateConnection({ connection: this._.clone(this.connection), idx: this.upsertConnectionId })
          }
          else {
            this.addConnection(this._.clone(this.connection))
          }

          this.upsertConnectionId = undefined
        }
        return valid
      })
    },

    ...mapActions('connections', ['deleteConnection', 'addConnection', 'updateConnection'])
  },

  head() {
    return {
      title: 'pulsar-express - connections'
    }
  }
}
</script>

<style scoped>
  
</style>