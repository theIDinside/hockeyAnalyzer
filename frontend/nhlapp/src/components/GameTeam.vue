<template>
  <div>
  <h2>{{team}} stats</h2><hr style="border-width: 10px" class="myOwnHr">
  <v-expansion-panel>
    <v-expansion-panel-content :key="GA" expand-icon="mdi-menu-down">
      <div slot="header"><h2>Game average stats</h2></div>
      <v-card>
        <v-card-title>Goals against/game average</v-card-title>
        <line-chart :title="'Goals against/Game '+team" :team="team" v-bind:dataType="'GA Game Average'" v-bind:dataSet="{ trendChartData: analysis.GAAverage.trendChartData }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Goals for/game average</v-card-title>
        <line-chart :title="'Goals for/Game ' + team" :team="team" v-bind:dataType="'GF Game Average'" v-bind:dataSet="{ trendChartData: analysis.GFAverage.trendChartData }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Total goals/game average</v-card-title>
        <line-chart :title="'Total goals/Game ' + team" :team="team" v-bind:dataType="'Total Goals Game'" v-bind:dataSet="{ trendChartData: analysis.TotalGoalsGameAverage.trendChartData  }"></line-chart>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content :key="PA"  expand-icon="mdi-menu-down">
      <div slot="header"><h2>Period average stats</h2></div>
      <v-card>
        <v-card-title>Goals for/period average</v-card-title>
        <line-chart :title="'Goals for/Period ' + team" :team="team" v-bind:dataType="'GFPA'" v-bind:dataSet="{ trendChartData: analysis.GFPeriodAverages }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Goals against/period average</v-card-title>
        <line-chart :title="'Goals against/Period ' + team" :team="team" v-bind:dataType="'GAPA'" v-bind:dataSet="{ trendChartData: analysis.GAPeriodAverages }"></line-chart>
      </v-card>
    </v-expansion-panel-content>
    <v-expansion-panel-content :key="GS" expand-icon="mdi-menu-down">
      <div slot="header"><h2>Season stats</h2></div>
      <v-card>
        <v-expansion-panel>
          <v-expansion-panel-content :key="EN" expand-icon="mdi-menu-down">
            <div slot="header"><b>Empty net scoring</b></div>
            <b>In the last {{ analysis.EmptyNetGoals.all_wins }} won, {{ analysis.EmptyNetGoals.games }} were won in regulation </b><br>
            Empty net goals were made in {{ analysis.EmptyNetGoals.ENGoals }} games out of {{ analysis.EmptyNetGoals.games }} won games. Empty net scoring percentage: {{ analysis.EmptyNetGoals.pct.toFixed(2) }}%
            <br>
            <b>In the last {{ analysis.EmptyNetLetUps.all_losses }} lost, {{ analysis.EmptyNetLetUps.games }} were lost in regulation </b><br>
            Empty net goals were let up in {{ analysis.EmptyNetLetUps.ENLetUps }} games out of {{ analysis.EmptyNetLetUps.games }} lost games. Empty net let up percentage: {{ analysis.EmptyNetLetUps.pct.toFixed(2) }}%

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

export default {
  components: {
    Team,
    LineChart
  },
  name: 'GameTeam',
  props: {
    analysis: Object,
    team: String
  },
  created () {
    console.log(`Team ${team}. Total goals/game average: ${analysis.TotalGoalsGameAverage.trendChartData}`)
  }
}
</script>

<style scoped>

</style>
