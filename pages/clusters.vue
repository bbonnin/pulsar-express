<template>
  <div class="dataview">
    <el-table
      :data="clusters"
      style="width: 90%"
      :default-sort = "{prop: 'name', order: 'descending'}">
      <el-table-column
        prop="name"
        label="Name"
        sortable
        width="100">
      </el-table-column>
      <el-table-column
        prop="url"
        label="URL"
        width="100">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Actions"
        width="120">
        <template slot-scope="scope">
          <el-button
            @click.native.prevent="deleteCluster(scope.$index)"
            type="text"
            size="small">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>   
  </div> 
</template>

<script>
export default {
  layout: 'dataview',

  data() {
    return {
      clusters: [],
    }
  },

  //TODO: si pas d'id de clusters sauvegardé dans le bnrowser, demander de suite l'ajout d'un cluster
  // Si cluster, affiche la page avec la liste des clusters
  mounted() {
    if (localStorage.pulsar) {
      // ok, on a des infos
      this.clusters = localStorage.pulsar.clusters
    }
    else {
      // ko, pas d'infos => on demande la saisie de points de connexion
      this.addCluster('local', 'http://localhost:6650')
    }
  },

  methods: {
    deleteCluster: function (idx) {
      console.log('delete', idx)
      this.clusters.splice(idx, 1)
      this.updateStorage()
    },

    addCluster: function (name, url) {
      this.clusters.push({ name, url })
      this.updateStorage()
    },

    updateStorage() {
      let pulsar = {}
      if (localStorage.pulsar) {
        pulsar = JSON.parse(localStorage.pulsar)
      }
      pulsar.clusters = this.clusters
      localStorage.pulsar = JSON.stringify(pulsar)
    }
  }
}
</script>
