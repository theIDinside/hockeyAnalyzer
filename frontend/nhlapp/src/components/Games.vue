<template>
    <div>Today's games
      <span v-if="loading">Fetching today's games... (waiting...)</span>
      <br>
      Date {{ date }}
      <ul>
        <router-link tag="li" v-for="game in gamesToday" :key="game.gameID" :to="{ name: 'Game', params: { gameID: game.gameID }}"><a>{{game.away}} vs {{game.home}}</a></router-link>
      </ul>
    </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'Games',
  data () {
    return {
      loading: true,
      gamesToday: [],
      date: null
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
      this.date = response.data.date
      console.log(`Date is ${this.date}`)
      this.loading = false
    }).catch(err => {
      console.log(`Communication with backend resulted in error: ${err}`)
    })
  }
}
</script>

<style scoped>

</style>
