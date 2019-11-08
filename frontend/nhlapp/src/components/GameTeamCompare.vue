<template>
  <div>
    <v-expansion-panel>
      <v-expansion-panel-content expand-icon="mdi-menu-down">
        <div slot="header"><h1>Stats comparison</h1></div>
        <v-card>

        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </div>
</template>

<script>
export default {
  name: 'GameTeamCompare',
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
