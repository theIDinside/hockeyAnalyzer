<template>
  <div id="app">
    <div>
      <games></games>
    </div>
    <div>
      <router-view/>
    </div>
  </div>
</template>

<script>
import Games from '@/components/Games'

export default {
  name: 'App',
  components: {
    Games
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
