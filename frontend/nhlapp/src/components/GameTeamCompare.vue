<template>
  <div>
      <v-expansion-panel>
        <v-expansion-panel-content expand-icon="mdi-menu-down">
          <div slot="header"><h1>Stats comparison</h1></div>
          <div class="columns">
            <div class="column">
              <v-card>
                <div>
                  <comparison-line-chart :percent="true" :title="'Powerplay comparison, 5 game span: '+awayAnalysis.team+' '+homeAnalysis.team" :teams="{ home: homeAnalysis.team, away: awayAnalysis.team }" v-bind:dataSetHome="{team: homeAnalysis.team, trendChartData: homeAnalysis.PP.trendChartData}" v-bind:data-set-away="{team: awayAnalysis.team, trendChartData: awayAnalysis.PP.trendChartData}"></comparison-line-chart>
                </div>
              </v-card>
            </div>
            <div class="column">
              <v-card>
                <div>
                  <comparison-line-chart :percent="true" :title="'Penalty Kill comparison, 5 game span: '+awayAnalysis.team+' '+homeAnalysis.team" :teams="{ home: homeAnalysis.team, away: awayAnalysis.team }" v-bind:dataSetHome="{team: homeAnalysis.team, trendChartData: homeAnalysis.PK.trendChartData}" v-bind:data-set-away="{team: awayAnalysis.team, trendChartData: awayAnalysis.PK.trendChartData}"></comparison-line-chart>
                </div>
              </v-card>
            </div>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </div>
</template>

<script>
import ComparisonLineChart from "./ComparisonLineChart";

export default {
  name: 'GameTeamCompare',
  components: {
    ComparisonLineChart
  },
  props: {
    homeAnalysis: Object,
    homeSeason: Object,
    awayAnalysis: Object,
    awaySeason: Object
  },
  methods: {
    compare () {

    }
  },
  data () {
    return {
      GAA: {
        periods: [0, 0, 0],
        game: 0
      },
      GFA: {
        periods: [0, 0, 0],
        game: 0
      },
      SAA: {
        periods: [0, 0, 0],
        game: 0
      },
      SFA: {
        periods: [0, 0, 0],
        game: 0
      },
      PeriodWins: [0, 0, 0],
      Corsi: 0,
      PDO: 0
    }
  }
}
</script>

<style scoped>

</style>
