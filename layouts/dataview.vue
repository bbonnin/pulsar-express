<template>
  <div>
    <nav-bar />
    <div class="dataview-container">
      <el-card shadow="never">
        <nuxt />
      </el-card> 
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
body {
  background: #f8f9fa;
}

.dataview-container {
  padding: 20px;
  width: 90%;
  margin: 4rem auto;
}

.button-bar {
  margin-top: 20px;
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
