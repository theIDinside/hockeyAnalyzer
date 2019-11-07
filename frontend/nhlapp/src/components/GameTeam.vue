<template>
  <div>
  <h2>{{team}} stats</h2><hr style="border-width: 10px" class="myOwnHr">
  <v-expansion-panel>
    <v-expansion-panel-content :key="GA" expand-icon="mdi-menu-down">
      <div slot="header"><h2>Game average stats</h2></div>
      <v-card>
        <v-card-title>Goals against/game average over 5 game span</v-card-title>
        <line-chart :title="'Goals against/Game '+team" :team="team" v-bind:dataType="'GA Game Average'" v-bind:dataSet="{ trendChartData: analysis.GAAverage.game.trendChartData }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Goals for/game average over 5 game span</v-card-title>
        <line-chart :title="'Goals for/Game ' + team" :team="team" v-bind:dataType="'GF Game Average'" v-bind:dataSet="{ trendChartData: analysis.GFAverage.game.trendChartData }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Total goals/game average over 5 game span</v-card-title>
        <line-chart :title="'Total goals/Game ' + team" :team="team" v-bind:dataType="'Total Goals Game'" v-bind:dataSet="{ trendChartData: analysis.GAverageTotal.game.trendChartData  }"></line-chart>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content :key="PA"  expand-icon="mdi-menu-down">
      <div slot="header"><h2>Period average stats</h2></div>
      <v-card>
        <v-card-title>Goals for/period average over 5 game span</v-card-title>
        <line-chart :title="'Goals for/Period ' + team" :team="team" v-bind:dataType="'GFPA'" v-bind:dataSet="{ trendChartData: analysis.GFAverage.periods }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Goals against/period average over 5 game span</v-card-title>
        <line-chart :title="'Goals against/Period ' + team" :team="team" v-bind:dataType="'GAPA'" v-bind:dataSet="{ trendChartData: analysis.GAAverage.periods }"></line-chart>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content :key="GS" expand-icon="mdi-menu-down">
      <div slot="header"><h2>Season stats</h2></div>
      <v-card>
        <v-expansion-panel>
          <v-expansion-panel-content :key="EN" expand-icon="mdi-menu-down">
            <div slot="header"><b>Empty net scoring</b></div>
            <div><b>In the last {{ analysis.EmptyNetGoals.all_wins }} won, {{ analysis.EmptyNetGoals.games }} were won in regulation </b><br>
            Empty net goals were made in {{ analysis.EmptyNetGoals.ENGoals }} games out of {{ analysis.EmptyNetGoals.games }} won games. Empty net scoring percentage: {{ analysis.EmptyNetGoals.pct.toFixed(2) }}%
            <br>
            <b>In the last {{ analysis.EmptyNetLetUps.all_losses }} lost, {{ analysis.EmptyNetLetUps.games }} were lost in regulation </b><br>
            Empty net goals were let up in {{ analysis.EmptyNetLetUps.ENLetUps }} games out of {{ analysis.EmptyNetLetUps.games }} lost games. Empty net let up percentage: {{ analysis.EmptyNetLetUps.pct.toFixed(2) }}%
            </div>
          </v-expansion-panel-content>
          <v-expansion-panel-content :key="SeasonAverages" expand-icon="mdi-menu-down">
            <div slot="header"><b>Season Averages</b></div>
            <div class="columns">
              <div class="column">
                <u>Per period</u><br>
                Goals for - [1: {{season.GFA.periods[0].toFixed(3)}}, 2: {{season.GFA.periods[1].toFixed(3)}}, 3:
                {{season.GFA.periods[2].toFixed(3)}}]<br>
                Goals against - [1: {{season.GAA.periods[0].toFixed(3)}}, 2: {{season.GAA.periods[1].toFixed(3)}}, 3:
                {{season.GAA.periods[2].toFixed(3)}}]<br>
                Shots for [1: {{season.SFA.periods[0].toFixed(3)}}, 2: {{season.SFA.periods[1].toFixed(3)}}, 3:
                {{season.SFA.periods[2].toFixed(3)}}]<br>
                Shots against [1: {{season.SAA.periods[0].toFixed(3)}}, 2: {{season.SAA.periods[1].toFixed(3)}}, 3:
                {{season.SAA.periods[2].toFixed(3)}}]<br>
              </div>
              <div class="column">
                <u>Per game</u><br>
                Goals for - [{{season.GFA.game.toFixed(3)}}]<br>
                Goals against - [{{season.GAA.game.toFixed(3)}}]<br>
                Shots for [{{season.SFA.game.toFixed(3)}}]<br>
                Shots against [{{season.SAA.game.toFixed(3)}}]<br>

              </div>
            </div>
            Corsi%: {{CorsiAveragePct(season.SFA.game, season.SAA.game).toFixed(2)}}%<br>
            PDO: {{PDOAverage(season.GAA.game, season.SAA.game, season.GFA.game, season.SFA.game).toFixed(3)}}%<br>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-card>
    </v-expansion-panel-content>
  </v-expansion-panel>
  </div>
</template>

<script>
import LineChart from './LineChart'
import Team from './Team'
import TeamSeason from './TeamSeason'

export default {
  components: {
    LineChart,
  },
  name: 'GameTeam',
  props: {
    analysis: Object,
    season: Object,
    team: String
  },
  methods: {
    /**
     * Returns the calculated Corsi, from team average.
     * @return {number}
     */
    CorsiAverage (forAverage, againstAverage) {
      return forAverage - againstAverage
    },
    /**
    * Returns the calculated Corsi, from team average.
    * @return {number}
    */
    CorsiAveragePct (favg, aavg) {
      return favg / (favg + aavg) * 100.0
    },
    /**
     * Returns the calculated PDO, from team average.
     * @return {number}
     */
    PDOAverage (gaavg, saavg, gfavg, sfavg) {
      return (1 - (gaavg / saavg) + gfavg / sfavg) * 100.0
    }
  },
  created () {
    console.log(`Team ${this.team}. Total goals/game average: ${this.analysis.GAverageTotal.game.trendChartData}`)
  }
}
</script>

<style scoped>

</style>
