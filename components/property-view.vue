<template>
  <div>
    <el-table
      :data="properties"
      style="width: 100%"
      height_="800"
      row-key="id"
      :default-expand-all="false"
      :default-sort = "{prop: 'name', order: 'ascending'}">
      <el-table-column
        fixed
        prop="name"
        label="Name"
        sortable
        width="400">
      </el-table-column>
      <el-table-column
        prop="value"
        label="Value">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  props: [ 'props' ],

  computed: {
    properties() {
      return this.toArray(this.props)
    }
  },

  methods: {
    isObject(obj) {
      return !!obj && obj.constructor === Object
    },

    toArray(obj, parentKey) {
      parentKey = parentKey || ''
      return Object.keys(obj).map(key => {
        if (this.isObject(obj[key])) {
          return { id: parentKey + '-' + key, name: key, value: '', children: this.toArray(obj[key], parentKey + '-' + key) }
        }
        else if (Array.isArray(obj[key])) {
          return { id: parentKey + '-' + key, name: key, value: obj[key].join(', ') }
        }
        return { id: parentKey + '-' + key, name: key, value: '' + obj[key] }
      })
    }
  }
}
</script>

<style scoped>

</style>