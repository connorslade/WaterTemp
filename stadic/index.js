
/*
let dataLen = 51
let i = -1
let labels = Array.from({length: dataLen}, () => i += 1);
let data = {
  labels: labels,
  datasets: [{
    label: 'Tempature',
    data: Array.from({length: dataLen}, () => Math.floor(Math.random() * dataLen)),
    fill: false,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
  }]
};
let config = {
  type: 'line',
  data: data,
};
var ctx = document.getElementById('myChart').getContext('2d');
var stackedLine = new Chart(ctx, config);

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
    });
    chart.update();
}
*/