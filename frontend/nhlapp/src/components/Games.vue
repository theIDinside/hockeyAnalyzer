<template>
    <div>Today's games

    </div>
</template>

<script>
    export default {
      name: "Games",
      data() {
          return {
            gamesToday: []
          }
      },
      mounted() {
        fetch(`${this.$API}/gamesToday`).then(result => {

        }).catch(err => {

        })
      }
    }
</script>

<style scoped>

</style>
