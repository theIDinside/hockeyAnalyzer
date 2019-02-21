import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Games from '@/components/Games'
import Game from '@/components/Game'

Vue.use(Router)
Vue.prototype.$API = 'http://localhost:3000'

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/games/today',
      name: 'Games',
      component: Games
    },
    {
      path: '/games/id/:gameID',
      name: 'Game',
      component: Game
    }]
})
