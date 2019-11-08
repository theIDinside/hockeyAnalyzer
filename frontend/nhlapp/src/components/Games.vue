<template>
    <div>Today's games
      <span v-if="loading">Fetching today's games... (waiting...)</span>
      <br>
      Date {{ date }}
      <ul>
        <router-link tag="li" v-for="game in gamesToday" :key="game.gameID" :to="{ name: 'Game', params: { gameID: game.gameID }}"><a>{{game.away}} vs {{game.home}} at {{game.date}}</a></router-link>
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
        let date = gInfo.datePlayed;
        let local_date_time = new Date();
        let usa_time = new Date(local_date_time.toLocaleString("en-US", {timeZone: "America/New_York"}))
        let diff = local_date_time - usa_time;
        let hour_diff = Math.floor(diff/1000/60/60);
        let res = new Date(date);
        res.setHours(res.getHours() + hour_diff-1);
        console.log(`Corrected Date played: ${res.toISOString()} from american time: ${date}`)
        let date_string = res.toLocaleString().split(" ")[1];
        return {
            gameID: gInfo.gameID,
            gameUrl: `/games/id/${gInfo.gameID}`,
            home: gInfo.home,
            away: gInfo.away,
            date: date_string
        }
      })
      this.date = new Date();
      console.log(`Date is ${this.date}`)
      this.loading = false
    }).catch(err => {
      console.log(`Communication with backend resulted in error: ${err}`)
    })
  },
}
</script>

<style scoped>

</style>
