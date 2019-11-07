<template>
  <div>
    <v-expansion-panel>
      <v-expansion-panel-content :key="SC" expand-icon="mdi-menu-down">
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
  }
}
</script>

<style scoped>

</style>
