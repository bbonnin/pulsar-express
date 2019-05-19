<template>
  <div>
    <div class="dataview">
      <div v-if="connections.length > 0">
        <el-table
          :data="connections"
          style="width: 100%"
          :default-sort = "{prop: 'name', order: 'descending'}">
          <el-table-column
            fixed
            prop="name"
            label="Name"
            width="200">
          </el-table-column>
          <el-table-column
            prop="url"
            label="API URL">
          </el-table-column>
          <el-table-column
            fixed="right"
            label="Actions"
            width="120">
            <template slot-scope="scope">
              <el-button
                @click.native.prevent="deleteConnection(scope.$index)"
                type="text"
                size="small">
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="button-bar">
        <el-button type="primary" @click="addConnectionVisible = true">Add a connection</el-button>
      </div>
    </div>

    <el-dialog title="Add a connection" :visible.sync="addConnectionVisible">
      <el-form ref="connectionForm" :model="connection" :rules="connectionRules" label-width="200px">
        <el-form-item label="Connection name" prop="name">
          <el-input v-model="connection.name"></el-input>
        </el-form-item>
        <el-form-item label="Pulsar API url" prop="url">
          <el-input v-model="connection.url"></el-input>
        </el-form-item>
        <el-form-item label="With security">
          <el-switch v-model="withSecurity"></el-switch>
        </el-form-item>
        <div v-if="withSecurity">
          <el-form-item label="User name" prop="user">
            <el-input v-model="connection.user"></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="pwd">
            <el-input type="password" v-model="connection.pwd"></el-input>
          </el-form-item>
        </div>
        <el-form-item>
          <el-button type="primary" @click="createConnection('connectionForm')">Create</el-button>
          <el-button @click="addConnectionVisible = false">Cancel</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getConnections, addConnection, removeConnection } from '@/services/storage'

export default {
  layout: 'dataview',

  data() {
    return {
      addConnectionVisible: false,
      connections: [],
      withSecurity: false,
      connection: {
        name: 'My local connection',
        url: 'http://localhost:8080',
        user: '',
        pwd: ''
      },
      connectionRules: {
        name: [
          { required: true, message: 'Please set a connection name', trigger: 'blur' }
        ],
        url: [
          { required: true, message: 'Please set the Pulsar URL', trigger: 'blur' },
          { pattern: /https?:\/\//, message: 'URL must start with http(s)://', trigger: 'blur' }
        ]
      }
    }
  },

  mounted() {
    this.connections = getConnections()
  },

  methods: {
    createConnection: function (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.connections = addConnection(this.connection)
          this.addConnectionVisible = false
        }
        return valid
      })
    },

    deleteConnection: function (idx) {
      this.connections = removeConnection(idx)
    }
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