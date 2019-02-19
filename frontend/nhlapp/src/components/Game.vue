<template>
    
</template>

<script>
  import Team from './Team'

    export default {
        name: "Game",
      props: { // read only data, passed down from the parent.
        gameID: Number,
        date: Date,
        homeTeam: String,
        awayTeam: String,
        homeAnalysis: Object,
        awayAnalysis: Object
      },
      components: {
          Team
      },
      data() { // the private "memory pool" that each component owns. The component can change this data.
        return {
          loading: false,

        }
      },
      created() {
        fetch(`${this.$API}/gameInfo/${this.$route.params.gameID}`).then(result => {
          // first, get the gameInfo data, that is linked to gameID.
          // then, populate team names & date played.
          // After this is done, send a request to analyze the teams history.
          return Promise.all([fetch(`${this.$API}/team/${home}`), fetch(`${this.$API}/team/${away}`)])
        }).then(analysis => {
          let [homeA, awayA] = analysis;

        }).catch(err => {

        })
      }
    }
</script>

<style scoped>

</style>
