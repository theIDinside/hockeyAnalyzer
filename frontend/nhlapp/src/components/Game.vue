<template>
  <div>
  <div v-if="loading">Acquiring analysis of team data & trends... please wait</div>
  <div v-else>
    <h1>
      {{homeTeam}} vs {{awayTeam}}
    </h1>
    <div class="columns">
      <div class="column" v-bind:id="homeTeam">
        <h2>{{homeTeam}} stats</h2><hr style="border-width: 10px" class="myOwnHr">
      <line-chart title="Goals against/Game home" v-bind:dataType="'GA Game Average'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GAAverage.trendChartData }"></line-chart>
      <line-chart title="Goals for/Game home" v-bind:dataType="'GF Game Average'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GFAverage.trendChartData }"></line-chart>
      <line-chart title="Total goals/Game home" v-bind:dataType="'Total Goals Game'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.TotalGoalsGameAverage.trendChartData  }"></line-chart>
      <line-chart title="Goals for/Period home" v-bind:dataType="'GFPA'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GFPeriodAverages }"></line-chart>
      <line-chart title="Goals against/Period home" v-bind:dataType="'GAPA'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GAPeriodAverages }"></line-chart>
      </div>
      <div class="column" v-bind:id="awayTeam">
        <h2>{{awayTeam}} stats</h2><hr>
        <line-chart title="Goals against/Game away" v-bind:dataType="'GA Game Average'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GAAverage.trendChartData }"></line-chart>
        <line-chart title="Goals for/Game away" v-bind:dataType="'GF Game Average'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GFAverage.trendChartData }"></line-chart>
        <line-chart title="Total goals/Game away" v-bind:dataType="'Total Goals Game'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.TotalGoalsGameAverage.trendChartData  }"></line-chart>
        <line-chart title="Goals for/Period away" v-bind:dataType="'GFPA'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GFPeriodAverages }"></line-chart>
        <line-chart title="Goals against/Period away" v-bind:dataType="'GAPA'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GAPeriodAverages }"></line-chart>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import LineChart from './LineChart'
import axios from 'axios'
import Team from './Team'
// const AnalysisKeys = ['GAAverage', 'GFAverage', 'TotalGoalsGameAverage', 'GAPeriodAverages', 'GFPeriodAverages', 'PeriodWins', 'TotalGoalsPeriodAverage', 'EmptyNetLetUps', 'EmptyNetGoals']
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
  hr {
    height: 3px;
    background-color: cornsilk;
  }
  h1 {
    font-size: 25px;
    font-weight: bold;
  }
  h2 {
    font-size: 20px;
    font-weight: lighter;
  }
</style>
