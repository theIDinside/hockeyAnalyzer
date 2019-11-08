<template>
  <div>
    {{title}}<br>
    <canvas v-bind:id="this.title" width="300px" height="300px"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js'

function makeDataSets (arr, dt, title) {
  const colors = ['rgba(54,73,93,1)', 'rgba(255,0,12,1)', 'rgba(5,255,12,1)']
  const bgcolors = ['rgba(124,34,93, 0.3)', 'rgba(184,99,12,0.4)', 'rgba(189,255,112,0.45)']
  
  return arr.map((stat, index) => {
    return {
      label: stat.team,
      data: [...stat.trendChartData],
      backgroundColor: [
        bgcolors[index] // Blue
      ],
      borderColor: [
        colors[index]// Blue
      ],
      borderWidth: 3
    }
  })
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
  name: 'ComparisonLineChart',
  props: {
    title: String,
    teams: Object,
    dataSetHome: Object,
    dataSetAway: Object,
    dataType: String,
    percent: Boolean
  },
  data () {
    return {
      loaded: false,
      datacollection: {
        labels: this.dataSet.trendChartData.map((val, i) => i.toString()),
        datasets: [{
          label: this.title,
          backgroundColor: '#f87979',
          pointBackgroundColor: 'white',
          borderWidth: 1,
          pointBorderColor: '#249EBF',
          data: [...this.dataSet.trendChartData]
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
          maintainAspectRatio: true
        }
      }
    }
  },
  mounted () {
    console.log(`Comparison line chart mounted! ${this.teams.home} - ${this.teams.away}`)
    this.createChart(this.title, this.percent)
  },
  watch: {
    'this.dataSet': 'createChart'
  },
  methods: {
    createChart (title, percent=false) {
      let arr = [this.dataSetHome, this.dataSetAway];


      let ds = makeDataSets(arr, this.dataType, title);

      let d = {
        type: 'line',
        title: this.title,
        data: {
          labels: this.dataSetHome.trendChartData.map((v, i) => `${ChartGameLabelIndex(5 - i)}`),
          datasets: ds
        },
        options: {
          maintainAspectRatio: true,
          responsive: false,
          lineTension: 1,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
                min: 0,
                padding: 25,
                callback: function(value, index, values) {
                   if(percent === true) {
                    console.log(`Values: ${value}`);
                    return `${value}%`
                  } else {
                    return value
                  }
                }
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                console.log(`Tooltipitem label: ${tooltipItem.label}`)
                if(percent) {
                  console.log(`Tooltip callback -> Val: ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}. Index: ${tooltipItem.index}`);
                  return `${data.datasets[tooltipItem.datasetIndex].label} ${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}%`;
                } else {
                  return `${data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]}`
                }
              }
            }
          }
        }
      }
      let ctx = document.getElementById(this.title)
      ctx.height = 300
      ctx.width = 900
      const chart = new Chart(ctx, {
        type: 'line',
        data: d.data,
        options: d.options
      })
      chart.title = title
    },
    changeAnalyzeSpan (span) {

    }
  }
}
</script>

<style scoped>
  canvas {
    width: 900px;
  }
</style>
