<template>
  <div class="dataview">
    <div v-if="currentTopic">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/topics' }">Topics</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentTopic.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      <loading v-if="loading" />
      <el-table
        :data="infos"
        style="width: 100%"
        height_="800">
        <el-table-column
          fixed
          label="Full name"
          width="300">
          <template slot-scope="scope">
            {{fullname}}
          </template>
        </el-table-column>
        <el-table-column
          label="Persistent">
          <template slot-scope="scope">
            <i class="el-icon-check" v-if="scope.row.persistent"></i>
          </template>
        </el-table-column>
        <el-table-column
          prop="stats.msgRateIn"
          label="Msg/s in">
        </el-table-column>
        <el-table-column
          prop="stats.msgRateOut"
          label="Msg/s out">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputIn"
          label="Byte/s in">
        </el-table-column>
        <el-table-column
          prop="stats.msgThroughputOut"
          label="Byte/s out">
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-alert
        title="Oops!"
        type="error"
        description="It seems that this topic does not exist..."
        show-icon>
      </el-alert>
    </div>
  </div>
</template>

<script>
import loading from '@/components/loading'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'topic',

  layout: 'dataview',

  components: {
    loading
  },

  data() {
    return {
      loading: false
    }
  },

  computed: {
    ...mapState('context', ['topic', 'topics']),

    currentTopic() {
      if (this.topics && this.topics.length > this.topic) {
        console.log(this.topics[this.topic])
        return this.topics[this.topic]
      }

      return null
    },

    fullname() {
      const name = this.currentTopic.persistent ? "persistent" : "non-persistent"
      return name + '://' + this.currentTopic.name
    },

    infos() {
      return [ this.currentTopic ]
    }
  },

  mounted() {
    
  },

  head() {
    return {
      title: 'pulsar-express - topic'
    }
  }
}
</script>
