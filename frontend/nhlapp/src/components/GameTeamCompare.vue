<template>
  <div>
      <v-expansion-panels>
        <v-expansion-panel>
        <v-expansion-panel-header expand-icon="mdi-menu-down"><h1><b>Stats comparison</b></h1></v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="columns">
            <div class="column">
              <v-card>
                <div>
                  <comparison-line-chart :percent="true" :title="'Powerplay comparison/5 game span: '+awayAnalysis.team+' vs '+homeAnalysis.team" :teams="{ home: homeAnalysis.team, away: awayAnalysis.team }" v-bind:dataSetHome="{team: homeAnalysis.team, trendChartData: homeAnalysis.PP.trendChartData}" v-bind:data-set-away="{team: awayAnalysis.team, trendChartData: awayAnalysis.PP.trendChartData}"></comparison-line-chart>
                </div>
              </v-card>
              <br>
              <v-card>
                <div>
                  <comparison-line-chart :percent="false" :title="'Powerplays per game average/5 game span: '+awayAnalysis.team+' vs '+homeAnalysis.team" :teams="{ home: homeAnalysis.team, away: awayAnalysis.team }" v-bind:data-set-home="{team: homeAnalysis.team, trendChartData: homeAnalysis.PP.power_plays_amount_avg}" v-bind:data-set-away="{team: awayAnalysis.team, trendChartData: awayAnalysis.PP.power_plays_amount_avg}"></comparison-line-chart>
                </div>
              </v-card>
            </div>
            <div class="column">
              <v-card>
                <div>
                  <comparison-line-chart :percent="true" :title="'Penalty Kill comparison/5 game span: '+awayAnalysis.team+' vs '+homeAnalysis.team" :teams="{ home: homeAnalysis.team, away: awayAnalysis.team }" v-bind:data-set-home="{team: homeAnalysis.team, trendChartData: homeAnalysis.PK.trendChartData}" v-bind:data-set-away="{team: awayAnalysis.team, trendChartData: awayAnalysis.PK.trendChartData}"></comparison-line-chart>
                </div>
              </v-card>
              <br>
              <v-card>
                <div>
                  <comparison-line-chart :percent="false" :title="'Penalty kills per game average/5 game span: '+awayAnalysis.team+' vs '+homeAnalysis.team" :teams="{ home: homeAnalysis.team, away: awayAnalysis.team }" v-bind:dataSetHome="{team: homeAnalysis.team, trendChartData: homeAnalysis.PK.penalties_amount_avg}" v-bind:data-set-away="{team: awayAnalysis.team, trendChartData: awayAnalysis.PK.penalties_amount_avg}"></comparison-line-chart>
                </div>
              </v-card>
            </div>
          </div>
        </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
</template>

<script>
import ComparisonLineChart from "./charts/ComparisonLineChart";

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
  },
  mounted() {

  }
}
</script>

<style scoped>

</style>
