<template>
    <div class="WinLossTable">
        <div class="WinLossRow">
            <win-loss-cell v-for="(game, index) in this.games" :key="index" v-bind:won="game.won" :opponent="game.opponent" :result="game.result" :date="game.date"></win-loss-cell> >> Now
        </div>
    </div>
</template>

<style scoped>
    div.WinLossTable {
        display: table;
        border-spacing: 5px;
    }
    div.WinLossRow{
        display: table-row;
        border-style:solid;
        border-color: black;
        border-width:15px;
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 15px;
        padding-bottom: 15px;
        margin-top:25px;
        margin-bottom:25px;
        margin-right:50px;
        margin-left:50px;
    }
</style>

<script>
    import WinLossCell from './WinLossCell'
    export default {
        name: "LastGameResults",
        components: {WinLossCell},
        props: {
            team: String,
            games: Array,
        },
        mounted() {
          for(let game of this.games) {
              console.log(`Game won: ${game.won} vs ${game.opponent} played ${game.date}. Final result: ${game.result.away}-${game.result.home}`)
          }
        }
    }

</script>

<style scoped>

</style>