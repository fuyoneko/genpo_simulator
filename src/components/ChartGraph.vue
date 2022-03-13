<template>
  <canvas :id="data_id" width="360" height="360"></canvas>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  data() {
    return {
      data_id: "outputCharts",
      chart: null
    };
  },
  computed: {
    context() {
      return document.getElementById(this.data_id);
    }
  },
  methods: {
    execute(binning) {
      if (this.chart != null) {
        // グラフを更新する
        this.chart.clear();
        this.chart.data.labels = binning.map(item => item.text);
        this.chart.data.datasets[0].data = binning.map(item => item.count / 10);
        this.chart.update();
      } else {
        // グラフを新規作成する
        this.chart = new Chart(this.context, {
          type: "bar",
          data: {
            labels: binning.map(item => item.text),
            datasets: [
              {
                label: "取得率",
                data: binning.map(item => item.count / 10),
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1
              }
            ]
          },
          options: {
            indexAxis: "y",
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }
  }
};
</script>

<style></style>
