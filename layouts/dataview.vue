<template>
  <div>
    <nav-bar />
    <div class="dataview-container">
      <nuxt />
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/navbar'

export default {
  components: { NavBar },
}
</script>

<style>
.dataview-container {
  margin-top: 3.6rem;
  padding: 20px;
}

.dataview-container .dataview {
  width: 80%;
  margin: auto;
}

.button-bar {
  margin-top: 10px;
}

.breadcrumb {
  margin: 20px 0 20px 0;
}

.simple-msg {
  font-size: 16px;
  color: #606266;
  margin-left: 5px;
}
</style>
