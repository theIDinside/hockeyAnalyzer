<template>
    <div v-if="won" class="WinCell">W</div>
    <div v-else class="LossCell">L</div>
</template>

<style scoped>

div.WinCell {
    display: table-cell;
    border-style: solid;
    border-width:2px;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    font-weight:800;
    font-size:100%;
    background: green;
}
div.LossCell {
    display: table-cell;
    border-style: solid;
    border-width:2px;
    padding-left: 13px;
    padding-right: 13px;
    padding-top: 10px;
    padding-bottom: 10px;
    font-weight:800;
    font-size:100%;
    background: red;
}

</style>

<script>
    export default {
        name: "WinLossCell",
        props: {
            won: Boolean,
            opponent: String,
            result: Object,
            date: Date
        },
        mounted() {
            console.log(`Win/Loss cell mounted!: Props -  Won: ${this.won}. Opponent: ${this.opponent}, result: ${this.result.away}-${this.result.home}`)
        }
    }
</script>

<style scoped>

</style>