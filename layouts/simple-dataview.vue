<template>
  <div>
    <nav-bar />
    <div class="simple-dataview-container">
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
.simple-dataview-container {
  padding: 20px;
  width: 80%;
  margin: 4rem auto;
}
</style>
