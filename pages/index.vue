<template>
  <section class="container">
    <div>
      <div class="logo">
        <img src="/pulsar.svg"/>
      </div>    
      <h2 class="subtitle">
        Simple Web Interface for Apache Pulsar
      </h2>
      <div class="links">
        <el-button type="primary" @click="$router.push('/connections')">Let's start !</el-button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
}
</script>

<style scoped>
.logo {
  margin: 50px;
}

.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 50px;
}
</style>
