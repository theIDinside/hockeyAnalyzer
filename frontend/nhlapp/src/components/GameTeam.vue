<template>
  <div>
  <h2>{{team}} stats</h2><hr style="border-width: 10px" class="myOwnHr">
  <v-expansion-panels multiple>

    <v-expansion-panel>
      <v-expansion-panel-header expand-icon="mdi-menu-down"><b>Last 5 games</b></v-expansion-panel-header>
      <v-expansion-panel-content>
        <div>Last 5 games</div>
        <div>
          <last-game-results :games="computeLastGameResults()" :five-game-span="analysis.LastFivePlayedSpan" :last-played="analysis.LastFive[4].date" :team="analysis.team"></last-game-results>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header expand-icon="mdi-menu-down"><b>Game average stats</b></v-expansion-panel-header>
        <v-expansion-panel-content>

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
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header expand-icon="mdi-menu-down"><h2><b>Period average stats</b></h2></v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-card>
        <v-card-title>Goals for/period average over 5 game span</v-card-title>
        <line-chart :title="'Goals for/Period ' + team" :team="team" v-bind:dataType="'Multiple:GFPA'" v-bind:dataSet="{ trendChartData: analysis.GFAverage.periods }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Goals against/period average over 5 game span</v-card-title>
        <line-chart :title="'Goals against/Period ' + team" :team="team" v-bind:dataType="'Multiple:GAPA'" v-bind:dataSet="{ trendChartData: analysis.GAAverage.periods }"></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Period wins over last 10 games </v-card-title>
        <circle-chart :labels="['Period 1', 'Period 2', 'Period 3']" :chart-type="'pie'" :title="'Period wins ' + team" :team="team" v-bind:dataType="'Multiple:PeriodWins'" v-bind:dataSet="{ trendChartData: analysis.PeriodWins.map(pw_stat => pw_stat.wins) }"></circle-chart>
      </v-card>
    </v-expansion-panel-content>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header expand-icon="mdi-menu-down"><h2><b>Special teams 5 game span averages</b></h2></v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-card>
        <v-card-title>Penalty Killing 5 game span</v-card-title>
        <line-chart :title="'Penalty Killing '+team" :team="team" v-bind:dataType="'PK stats'" v-bind:dataSet="{ trendChartData: analysis.PK.trendChartData }" v-bind:percent=true></line-chart>
      </v-card>
      <v-card>
        <v-card-title>Power play 5 game span</v-card-title>
        <line-chart :title="'Power play '+team" :team="team" v-bind:dataType="'PP stats'" v-bind:dataSet="{ trendChartData: analysis.PP.trendChartData }" v-bind:percent=true></line-chart>
      </v-card>
    </v-expansion-panel-content>
    </v-expansion-panel>

    <v-expansion-panel>
      <v-expansion-panel-header expand-icon="mdi-menu-down"><h2><b>Season stats</b></h2></v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-card>
          <v-expansion-panel>
            <v-expansion-panel-header expand-icon="mdi-menu-down">Empty net scoring</v-expansion-panel-header>
            <v-expansion-panel-content>
              <div><b>In the last {{ analysis.EmptyNetGoals.all_wins }} won, {{ analysis.EmptyNetGoals.games }} were won in regulation </b><br>
              Empty net goals were made in {{ analysis.EmptyNetGoals.ENGoals }} games out of {{ analysis.EmptyNetGoals.games }} won games. Empty net scoring percentage: {{ analysis.EmptyNetGoals.pct.toFixed(2) }}%
              <br>
              <b>In the last {{ analysis.EmptyNetLetUps.all_losses }} lost, {{ analysis.EmptyNetLetUps.games }} were lost in regulation </b><br>
              Empty net goals were let up in {{ analysis.EmptyNetLetUps.ENLetUps }} games out of {{ analysis.EmptyNetLetUps.games }} lost games. Empty net let up percentage: {{ analysis.EmptyNetLetUps.pct.toFixed(2) }}%
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>

            <v-expansion-panel>
              <v-expansion-panel-header expand-icon="mdi-menu-down">Season Averages</v-expansion-panel-header>
              <v-expansion-panel-content>
              <div class="columns">
                  <div class="column">
                    <u>Per period (Only regulation stats)</u><br>
                    Goals for [{{season.GFA.periods.reduce((res, val, index) => `${res} ${index+1}: ${val.toFixed(3)}${index !== 2 ? ',' : ""}`, "")}} ] <br>
                    Goals against [{{season.GAA.periods.reduce((res, val, index) => `${res} ${index+1}: ${val.toFixed(3)}${index !== 2 ? ',' : ""}`, "")}} ] <br>
                    Shots for [{{season.SFA.periods.reduce((res, val, index) => `${res} ${index+1}: ${val.toFixed(3)}${index !== 2 ? ',' : ""}`, "")}} ] <br>
                    Shots against [{{season.SAA.periods.reduce((res, val, index) => `${res} ${index+1}: ${val.toFixed(3)}${index !== 2 ? ',' : ""}`, "")}} ] <br>
                  </div>
                  <div class="column">
                    <u>Per game (Only regulation stats)</u><br>
                    Goals for [{{season.GFA.game.toFixed(3)}}]<br>
                    Goals against - [{{season.GAA.game.toFixed(3)}}]<br>
                    Shots for [{{season.SFA.game.toFixed(3)}}]<br>
                    Shots against [{{season.SAA.game.toFixed(3)}}]<br>
                  </div>
                </div>
              Corsi%: {{CorsiAveragePct(season.SFA.game, season.SAA.game).toFixed(2)}}%<br>
              PDO: {{PDOAverage(season.GAA.game, season.SAA.game, season.GFA.game, season.SFA.game).toFixed(3)}}%<br>
            </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel>
                <v-expansion-panel-header expand-icon="mdi-menu-down">Stats against teams in {{season.divisionAnalysis.division}} Divsion</v-expansion-panel-header>
                <v-expansion-panel-content>
                    Games played against {{season.divisionAnalysis.division}} teams: {{season.divisionAnalysis.wins + season.divisionAnalysis.losses}}
                    <div class="columns">
                        <div class="column">
                            Wins: {{season.divisionAnalysis.wins}}<br>
                            Total goals for: {{season.divisionAnalysis.totals.GF}}<br>
                            Total shots for: {{season.divisionAnalysis.totals.SF}}<br>
                            Goals for average: {{season.divisionAnalysis.averages.GFA.toFixed(3)}}<br>
                        </div>
                        <div class="column">
                            Losses: {{season.divisionAnalysis.losses}}<br>
                            Total goals against: {{season.divisionAnalysis.totals.GA}}<br>
                            Total shots against: {{season.divisionAnalysis.totals.SA}}<br>
                            Goals against average: {{season.divisionAnalysis.averages.GAA.toFixed(3)}}<br>
                        </div>
                    </div>

                </v-expansion-panel-content>
            </v-expansion-panel>

        </v-card>
    </v-expansion-panel-content>
    </v-expansion-panel>

  </v-expansion-panels>
  </div>
</template>

<script>
import LineChart from './charts/LineChart'
import CircleChart from './charts/CircleChart'
import LastGameResults from './charts/LastGameResults'
export default {
  components: {
    LastGameResults,
    LineChart,
    CircleChart
  },
  name: 'GameTeam',
  props: {
    analysis: Object,
    season: Object,
    team: String,
    opponent: String,
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
    },
    computeLastGameResults () {
      return this.analysis.LastFive;
    }
  },
  created () {

  }
}
</script>

<style scoped>

</style>
