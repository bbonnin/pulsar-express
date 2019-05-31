<template>
  <header class="navbar">
    <nuxt-link to="/overview">
      <img alt="pulsar-logo" class="logo" src="/pulsar.svg" />
    </nuxt-link>
    <div class="links">
      <nav class="nav-links">
        <div class="nav-item">
          <nuxt-link to="/clusters">Clusters</nuxt-link>
        </div>
        <div class="nav-item">
          <nuxt-link to="/brokers">Brokers</nuxt-link>
        </div>
        <div class="nav-item">
          <nuxt-link to="/tenants">Tenants</nuxt-link>
        </div>
        <div class="nav-item">
          <nuxt-link to="/namespaces">Namespaces</nuxt-link>
        </div>
        <div class="nav-item">
          <nuxt-link to="/topics">Topics</nuxt-link>
        </div>
        <div class="nav-item">
          <nuxt-link to="/functions">Functions</nuxt-link>
        </div>
        <div class="nav-item">
          <nuxt-link to="/connections">Connections</nuxt-link>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {

}
</script>

<style scoped>
.navbar {
  position: absolute;
  top: 0;
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

a {
  display: flex;
  align-items: center;
}

.logo {
  height: 35px;
  padding-right: 8px;
}

.links {
  padding-left: 1.5rem;
  box-sizing: border-box;
  white-space: nowrap;
  font-size: 0.9rem;
  position: absolute;
  right: 1.5rem;
  top: 0.7rem;
  display: flex;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-item {
  position: relative;
  display: inline-block;
  margin-left: 1.5rem;
  line-height: 2.2rem;
  /*
  &:first-child {
    margin-left: 0;
  }*/
}

.nav-item a {
  font-weight: 500;
  font-size: 0.9rem;
  text-decoration: none;
  color: #2c3e50;
  border-color: #2c3e50;
  line-height: 1.4rem;
  display: inline-block;
  cursor: pointer;
}

.nav-item .nuxt-link-exact-active, .nav-item .nuxt-link-active, .nav-item a:hover {
  margin-bottom: -2px;
  border-bottom: 2px solid #188fff;
}
</style>