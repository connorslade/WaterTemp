const units = ['°F', '°C', '°K'];
const convert = [function (c) { return c }, function (c) { return (c-32)*(5/9) }, function (c) { return (c+459.67)*(5/9)}]

let tmp = 30;
let avg = 10;

let currentIdex = 0;

// Unit Changing

document.getElementById('unit').addEventListener("click", function () {
  currentIdex += 1;
  if (currentIdex >= units.length) currentIdex = 0;
  document.getElementById('unit').innerHTML = `<p>${units[currentIdex]}</p>`
  
  document.getElementById('temp').innerHTML = Math.round(convert[currentIdex](tmp) * 10) / 10;
  document.getElementById('avg').innerHTML = Math.round(convert[currentIdex](avg) * 10) / 10;
  document.getElementById('dev').innerHTML = Math.abs(Math.round(convert[currentIdex](avg) * 10 / 10 - convert[currentIdex](tmp) * 10 / 10));
});

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