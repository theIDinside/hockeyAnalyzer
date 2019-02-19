import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Games from '@/components/Games'

Vue.use(Router);

Vue.prototype.$API = 'http://localhost:3000';

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/games'
      name: 'Games',
      component: Games
    }
  ]
})
