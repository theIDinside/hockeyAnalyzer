<template>
  <div>
  <div v-if="loading">Acquiring analysis of team data & trends... please wait</div>
  <div v-else><h1>{{homeTeam}} vs {{awayTeam}}</h1></div>
  </div>
</template>

<script>
import axios from 'axios'
import Team from './Team'
import LineChart from './LineChart'
export default {
  name: 'Game',
  components: {
    Team,
    LineChart
  },
  data () { // the private "memory pool" that each component owns. The component can change this data.
    return {
      loading: true,
      gameID: 0,
      date: '',
      homeTeam: '',
      awayTeam: '',
      homeAnalysis: {},
      awayAnalysis: {}
    }
  },
  mounted () {
    this.gameID = this.$route.params.gameID
    console.log(`Fetching data from API at ${this.$API}/games/${this.$route.params.gameID}`)
    axios(`${this.$API}/games/${this.$route.params.gameID}`).then(res => {
      this.homeAnalysis = res.data.homeTeamAnalysis
      this.awayAnalysis = res.data.awayTeamAnalysis
      this.homeTeam = this.homeAnalysis.team
      this.awayTeam = this.awayAnalysis.team

      // first, get the gameInfo data, that is linked to gameID.
      // then, populate team names & date played.
      // After this is done, send a request to analyze the teams history.
      this.loading = false
    }).catch(err => {
      if (err) {
        console.log(err)
      }
    })
  },
  watch: {
    '$route': 'fullAnalysis' // this is needed, because components aren't destroyed, they are reused. So when we click on a router link, it will reuse the component.
    // Thus, this component, needs to watch (like a debugger watches a variable) the $route object, and if it changes,
    // it calls fullAnalysis()
  },
  methods: {
    fullAnalysis () {
      this.loading = true
      this.gameID = this.$route.params.gameID
      console.log(`Fetching data from API at ${this.$API}/games/${this.$route.params.gameID}`)
      axios(`${this.$API}/games/${this.$route.params.gameID}`).then(res => {
        this.homeAnalysis = res.data.homeTeamAnalysis
        this.awayAnalysis = res.data.awayTeamAnalysis
        this.homeTeam = this.homeAnalysis.team
        this.awayTeam = this.awayAnalysis.team

        // first, get the gameInfo data, that is linked to gameID.
        // then, populate team names & date played.
        // After this is done, send a request to analyze the teams history.
        this.loading = false
      }).catch(err => {
        if (err) {
          console.log(err)
        }
      })
    },
    periodWins (span) {

    },
    periodGoalAverage (span) {

    },
    gameGoalAverage (span) {

    },
    gameGoalForAverage (span) {

    },
    gameGoalAgainstAverage (span) {

    },
    emptyNetScoring (span) {

    },
    emptyNetLetUps (span) {

    }
  }
}
</script>

<style scoped>

</style>
