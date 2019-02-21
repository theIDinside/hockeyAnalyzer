<template>
  <div></div>
</template>

<script>
import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  name: 'LineChart',
  props: {
    title: String,
    dataSet: Object
  },
  data () {
    return {
      loaded: false,
      datacollection: {
        labels: [],
        datasets: [{
          label: this.title,
          backgroundColor: '#f87979',
          pointBackgroundColor: 'white',
          borderWidth: 1,
          pointBorderColor: '#249EBF',
          data: []
        }],
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            }],
            xAxes: [ {
              gridLines: {
                display: false
              }
            }]
          },
          legend: {
            display: true
          },
          responsive: true,
          maintainAspectRatio: false
        }
      }
    }
  },
  mounted () {
    if (this.loaded) {
      this.renderChart(this.datacollection, this.options)
    }
  }
}
</script>

<style scoped>

</style>
