<template>
    <div>Today's games
      <span v-if="loading">Fetching today's games...</span>
      <ul>
        <router-link tag="li" v-for="game in gamesToday" :key="game.gameID" :to="{ name: 'Game', params: { gameID: game.gameID }}"><a>{{game.away}} vs {{game.home}} at {{game.datePlayed}}</a></router-link>
      </ul>
    </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'GamesAtDate',
  data () {
    return {
      loading: true,
      gamesToday: []
    }
  },
  mounted () {
    axios.get(`${this.$API}/games/today`).then(response => {
      if (response.data.result.length === 0) {
        console.log('Found no games today... weird')
      }
      this.gamesToday = response.data.result.map(gInfo => {
        console.log(`${gInfo.home} vs ${gInfo.away}`)
        return {
          gameID: gInfo.gameID,
          gameUrl: `/games/id/${gInfo.gameID}`,
          home: gInfo.home,
          away: gInfo.away
        }
      })
      this.loading = false
    }).catch(err => {
      console.log(`Communication with backend resulted in error: ${err}`)
    })
  }
}
</script>

<style scoped>

</style>
