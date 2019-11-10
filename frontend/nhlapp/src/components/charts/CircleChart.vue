<template>
  <div>
    <canvas v-bind:id="this.title+'_'+this.team" width="300px" height="300px"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'

function makeDataSets (arr) {
  const colors = ['rgba(54,73,93,1)', 'rgba(255,0,12,1)', 'rgba(5,255,12,1)']
  const bgcolors = ['rgba(124,34,93, 0.3)', 'rgba(184,99,12,0.4)', 'rgba(189,255,112,0.45)']
    return {
      label: "Period wins",
      data: arr,
      backgroundColor: [
        bgcolors
      ],
      borderColor: [
        colors// Blue
      ],
      borderWidth: 3
    }
}

/**
 * @return {string}
 */
function ChartGameLabelIndex (gameNumber) {
  if (gameNumber === 1) {
    return 'Current'
  } else if(gameNumber === 2) {
    return `${gameNumber-1} game ago`
  } else {
    return `${gameNumber-1} games ago`
  }
}

export default {
  name: 'CircleChart',
  props: {
    title: String,
    team: String,
    dataSet: Object,
    dataType: String,
    percent: Boolean,
    chartType: String,
    labels: Array,
  },
  data () {
    return {
      loaded: false,
    }
  },
  mounted () {
    console.log(`Data is loaded... render chart. Show percentage sign: ${this.percent}`)
    this.createChart(this.title, this.percent)
  },
  watch: {
    'this.dataSet': 'createChart'
  },
  methods: {
    createChart (title, percent=false) {

      let pieChart = {
        type: 'pie',
        data: {
          labels: this.labels,
          datasets: [ {
            label: '# of Tomatoes',
            data: this.dataSet.trendChartData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          cutoutPercentage: 40,
          responsive: false,
        }
      };

      console.log(`Trying to create ${this.chartType} type chart with labels ${this.labels} and values: ${this.dataSet.trendChartData}`)

      let ctx = document.getElementById(this.title + '_' + this.team)
      ctx.height = 300
      ctx.width = 900
      const chart = new Chart(ctx, pieChart);
      chart.title = title
    },
  }
}
</script>

<style scoped>
  canvas {
    width: 900px;
  }
</style>
