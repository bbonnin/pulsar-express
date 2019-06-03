<template>
  <div class="location-bar">
    <img :src="img + '.png'" width="32"/>
    <div class="nav-item">{{ location }}</div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('context', ['cluster']),

    location() {
      return this.cluster ? this.cluster.name : 'All clusters'
    },

    img() {
      const path = this.$route.path
      const idxSlash = path.indexOf('/', 1)
      return path.substring(0, idxSlash == -1 ? path.length : idxSlash)
    }
  }
}
</script>

<style scoped>
.location-bar {
  position: absolute;
  top: 3.6rem;
  left: 0;
  z-index: 20;
  right: 0;
  height: 3.6rem;
  background-color: #fff;
  box-sizing: border-box;
  border-bottom: 1px solid #eaecef;
  padding: 0.7rem 1.5rem;
  line-height: 2.2rem;
}

.nav-item {
  position: absolute;
  display: inline-block;
  margin-left: 1.5rem;
  line-height: 2.2rem;
  top: 0.7rem;
  color: #2c3e50;

}
</style>