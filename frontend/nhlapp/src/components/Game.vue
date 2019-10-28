<template>
  <div>
  <div v-if="loading">Acquiring analysis of team data & trends... please wait</div>
  <div v-else>
    <h1>
      {{awayTeam}} vs {{homeTeam}}
    </h1>
    <div class="columns">
      <div class="column" v-bind:id="awayTeam">
        <h2>{{awayTeam}} stats</h2><hr>
        <v-expansion-panel>
          <v-expansion-panel-content :key="GA" expand-icon="mdi-menu-down">
            <div slot="header"><h2>Game average stats</h2></div>
            <v-card>
              <v-card-title>Goals against/game average</v-card-title>
              <line-chart title="Goals against/Game away" v-bind:dataType="'GA Game Average'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GAAverage.trendChartData }"></line-chart>
            </v-card>
            <v-card>
              <v-card-title>Goals for/game average</v-card-title>
              <line-chart title="Goals for/Game away" v-bind:dataType="'GF Game Average'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GFAverage.trendChartData }"></line-chart>
            </v-card>
            <v-card>
              <v-card-title>Total goals/game average</v-card-title>
              <line-chart title="Total goals/Game away" v-bind:dataType="'Total Goals Game'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.TotalGoalsGameAverage.trendChartData  }"></line-chart>
            </v-card>
          </v-expansion-panel-content>
          <v-expansion-panel-content :key="PA"  expand-icon="mdi-menu-down">
            <div slot="header"><h2>Period average stats</h2></div>
            <v-card>
              <v-card-title>Goals for/period average</v-card-title>
              <line-chart title="Goals for/Period away" v-bind:dataType="'GFPA'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GFPeriodAverages }"></line-chart>
            </v-card>
            <v-card>
              <v-card-title>Goals against/period average</v-card-title>
              <line-chart title="Goals against/Period away" v-bind:dataType="'GAPA'" v-bind:dataSet="{ trendChartData: this.awayAnalysis.GAPeriodAverages }"></line-chart>
            </v-card>
          </v-expansion-panel-content>
          <v-expansion-panel-content :key="GS" expand-icon="mdi-menu-down">
            <div slot="header"><h2>Last games</h2></div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </div>

      <div class="column" v-bind:id="homeTeam">
        <h2>{{homeTeam}} stats</h2><hr style="border-width: 10px" class="myOwnHr">
        <v-expansion-panel>
          <v-expansion-panel-content :key="GA" expand-icon="mdi-menu-down">
            <div slot="header"><h2>Game average stats</h2></div>
            <v-card>
              <v-card-title>Goals against/game average</v-card-title>
              <line-chart title="Goals against/Game home" v-bind:dataType="'GA Game Average'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GAAverage.trendChartData }"></line-chart>
            </v-card>
            <v-card>
              <v-card-title>Goals for/game average</v-card-title>
              <line-chart title="Goals for/Game home" v-bind:dataType="'GF Game Average'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GFAverage.trendChartData }"></line-chart>
            </v-card>
            <v-card>
              <v-card-title>Total goals/game average</v-card-title>
              <line-chart title="Total goals/Game home" v-bind:dataType="'Total Goals Game'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.TotalGoalsGameAverage.trendChartData  }"></line-chart>
            </v-card>
          </v-expansion-panel-content>
          <v-expansion-panel-content :key="PA"  expand-icon="mdi-menu-down">
            <div slot="header"><h2>Period average stats</h2></div>
            <v-card>
              <v-card-title>Goals for/period average</v-card-title>
              <line-chart title="Goals for/Period home" v-bind:dataType="'GFPA'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GFPeriodAverages }"></line-chart>
            </v-card>
            <v-card>
              <v-card-title>Goals against/period average</v-card-title>
              <line-chart title="Goals against/Period home" v-bind:dataType="'GAPA'" v-bind:dataSet="{ trendChartData: this.homeAnalysis.GAPeriodAverages }"></line-chart>
            </v-card>
          </v-expansion-panel-content>
          <v-expansion-panel-content :key="GS" expand-icon="mdi-menu-down">
            <div slot="header"><h2>Last games</h2></div>

          </v-expansion-panel-content>
          <v-expansion-panel-content :key="GS" expand-icon="mdi-menu-down">
            <div slot="header"><h2>Bets</h2></div>

          </v-expansion-panel-content>
        </v-expansion-panel>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import LineChart from './LineChart'
import axios from 'axios'
import Team from './Team'

/*
const dateString = (date) => {
  let res = date.toLocaleDateString()
  let restmp = res.split('-')
  let y = Number.parseInt(restmp[0])
  let mNum = Number.parseInt(restmp[1])
  let dNum = Number.parseInt(restmp[2])
  return `${y}-${(mNum < 10) ? `0${mNum}` : mNum}-${(dNum < 10) ? `0${dNum}` : dNum}`
}
*/
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
    Team,
    LineChart
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
      awayAnalysis: {}
    }
  },
  mounted () {
    this.gameID = this.$route.params.gameID
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
    getLastHomeGames () {
      axios(`${this.$API}/team/${abbreviateName(this.homeTeam)}?at=home&amt=10`).then(response => {
        // let data = response.data
      })
    },
    getLastAwayGames () {

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
