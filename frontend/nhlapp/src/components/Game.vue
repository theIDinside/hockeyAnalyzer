<template>
  <div>
  <div v-if="loading">Acquiring analysis of team data & trends... please wait</div>
  <div v-if="!loading">
    <h1>
      {{awayTeam}} vs {{homeTeam}}
    </h1>
    <div class="columns">
      <div class="column">
        <game-team :analysis="awayAnalysis" :season="awaySeason" :team="awayTeam"></game-team>
      </div>
      <div class="column">
        <game-team :analysis="homeAnalysis" :season="homeSeason" :team="homeTeam"></game-team>
      </div>
    </div>
    <div>
      <game-team-compare :homeSeason="homeSeason" :awaySeason="awaySeason" :homeAnalysis="homeAnalysis" :awayAnalysis="awayAnalysis"></game-team-compare>
    </div>
    <div>
    <live-result :home="homeTeam" :away="awayTeam"></live-result>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios'
import GameTeam from './GameTeam'
import GameTeamCompare from '@/components/GameTeamCompare'
import LiveResult from './LiveResult'

function abbreviateName (team) {
  switch (team) {
    case 'Anaheim Ducks':
      return 'ANA'
    case 'Boston Bruins':
      return 'BOS'
    case 'Arizona Coyotes':
      return 'ARI'
    case 'Buffalo Sabres':
      return 'BUF'
    case 'Carolina Hurricanes':
      return 'CAR'
    case 'Chicago Blackhawks':
      return 'CHI'
    case 'Calgary Flames':
      return 'CGY'
    case 'Columbus Blue Jackets':
      return 'CBJ'
    case 'Colorado Avalanche':
      return 'COL'
    case 'Dallas Stars':
      return 'DAL'
    case 'Edmonton Oilers':
      return 'EDM'
    case 'New Jersey Devils': // for those places where N.J is used instead of NJD
      return 'NJD'
    case 'New York Islanders':
      return 'NYI'
    case 'New York Rangers':
      return 'NYR'
    case 'Minnesota Wild':
      return 'MIN'
    case 'Philadelphia Flyers':
      return 'PHI'
    case 'Detroit Red Wings':
      return 'DET'
    case 'Los Angeles Kings':
      return 'LAK'
    case 'Ottawa Senators':
      return 'OTT'
    case 'Montreal Canadiens':
      return 'MTL'
    case 'Pittsburgh Penguins':
      return 'PIT'
    case 'Washington Capitals':
      return 'WSH'
    case 'St. Louis Blues':
      return 'STL'
    case 'San Jose Sharks':
      return 'SJS'
    case 'Tampa Bay Lightning':
      return 'TBL'
    case 'Vancouver Canucks':
      return 'VAN'
    case 'Toronto Maple Leafs':
      return 'TOR'
    case 'Winnipeg Jets':
      return 'WGP'
    case 'Vegas Golden Knights':
      return 'VGK'
    case 'Florida Panthers':
      return 'FLA'
    case 'Nashville Predators':
      return 'NSH'
  }
}

// const AnalysisKeys = ['GAAverage', 'GFAverage', 'TotalGoalsGameAverage', 'GAPeriodAverages', 'GFPeriodAverages', 'PeriodWins', 'TotalGoalsPeriodAverage', 'EmptyNetLetUps', 'EmptyNetGoals']
export default {
  name: 'Game',
  components: {
    GameTeamCompare,
    GameTeam,
    LiveResult
  },
  data () { // the private "memory pool" that each component owns. The component can change this data.
    return {
      analyticTypes: ['Period stats', 'Game stats', 'Season'],
      loading: true,
      gameID: 0,
      date: '',
      homeTeam: '',
      awayTeam: '',
      homeAnalysis: {},
      homeSeason: {},
      awayAnalysis: {},
      awaySeason: {}
    }
  },
  mounted () {
    this.gameID = this.$route.params.gameID
    axios(`${this.$API}/games/${this.$route.params.gameID}`).then(res => {
      this.homeAnalysis = res.data.homeTeamSpanAnalysis
      console.log(`Home team : ${this.homeAnalysis.team}`)
      this.awayAnalysis = res.data.awayTeamSpanAnalysis
      console.log(`Home team : ${this.awayAnalysis.team}`)
      this.homeTeam = this.homeAnalysis.team
      this.awayTeam = this.awayAnalysis.team
      this.homeSeason = res.data.homeTeamSeasonAnalysis
      this.awaySeason = res.data.awayTeamSeasonAnalysis
      console.log(`Home season object instanceof==object: ${this.homeSeason instanceof Object}`)
      console.log(`Goals against period average for home team: ${this.homeAnalysis.GAAverage.periods.trendChartData}`)

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
        this.homeAnalysis = res.data.homeTeamSpanAnalysis
        this.awayAnalysis = res.data.awayTeamSpanAnalysis
        this.homeSeason = res.data.homeTeamSeasonAnalysis
        this.awaySeason = res.data.awayTeamSeasonAnalysis
        this.homeTeam = this.homeAnalysis.team
        this.awayTeam = this.awayAnalysis.team
        for (let p in this.homeAnalysis) {
          console.log(`Property p == ${p}`)
        }
        console.log(`Home season object instanceof==object: ${this.homeSeason instanceof Object}`)
        console.log(`Goals against period average for home team: ${this.homeAnalysis.GAAverage.periods.trendChartData}`)
        // first, get the gameInfo data, that is linked to gameID.
        // then, populate team names & date played.
        // After this is done, send a request to analyze the teams history.
        this.loading = false
      }).catch(err => {
        if (err) {
          console.log(err)
        }
      })
    }/*,
    getLastHomeGames () {
      axios(`${this.$API}/team/${abbreviateName(this.homeTeam)}?at=home&amt=10`).then(response => {
        // let data = response.data
      })
    },
    getLastAwayGames () {

    }*/
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
