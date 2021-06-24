const units = ['°F', '°C', '°K'];
const convert = [function (c) { return c }, function (c) { return (c-32)*(5/9) }, function (c) { return (c+459.67)*(5/9)}]

let stackedLine = null;
let socket = null;
let tmp = 30;
let avg = 10;

// Persistent Settings

if (localStorage.getItem('setup') === null) {
  localStorage.setItem('setup', true);
  localStorage.setItem('showingGraph', false);
  localStorage.setItem('unit', 0);
}

// Unit Changing

let currentIdex = parseInt(localStorage.getItem('unit'))
document.getElementById('unit').innerHTML = `<p>${units[currentIdex]}</p>`
document.getElementById('unit').addEventListener("click", function () {
  currentIdex += 1;
  if (currentIdex >= units.length) currentIdex = 0;
  localStorage.setItem('unit', currentIdex)
  document.getElementById('unit').innerHTML = `<p>${units[currentIdex]}</p>`
  
  document.getElementById('temp').innerHTML = Math.round(convert[currentIdex](tmp) * 10) / 10;
  document.getElementById('avg').innerHTML = Math.round(convert[currentIdex](avg) * 10) / 10;
  document.getElementById('dev').innerHTML = Math.abs(Math.round(convert[currentIdex](avg) * 10 / 10 - convert[currentIdex](tmp) * 10 / 10));
});

// Align Top Boxes

let boxes = document.getElementsByClassName("unit");
let acu = 5;
Object.keys(boxes).forEach((e) => {
  boxes[e].style.marginRight = `${acu}px`;
  acu += 47;
});

// Update Data

function updateData(tmp, avg) {
  document.getElementById('temp').innerHTML = Math.round(convert[currentIdex](tmp) * 10) / 10;
  document.getElementById('avg').innerHTML = Math.round(convert[currentIdex](avg) * 10) / 10;
  document.getElementById('dev').innerHTML = Math.abs(Math.round(convert[currentIdex](avg) * 10 / 10 - convert[currentIdex](tmp) * 10 / 10));
  addData(stackedLine, '?', tmp)
  removeData(stackedLine)
}

// Websocket Init

window.onload = function () {
  createWebSocket();
};

function createWebSocket() {
  let wsProto = "ws";
  if (location.protocol === "https:") wsProto = "wss";
  socket = new WebSocket(`${wsProto}://${window.location.href.split("/")[2]}`);

  socket.onopen = function () {
    setError(false);
  };

  socket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    console.log(data)
    switch (data.event) {
      case 'update':
        updateData(data.tmp, data.avg);
        break;
        
      case 'init':
        initGraph(data.data)
        updateData(data.tmp, data.avg);
        break;
    }
  };

  socket.onclose = function (event) {
    if (event.wasClean) return;
    if (event.code === 1000) return;
    setError(true);
    setTimeout(createWebSocket, 5000);
  };

  socket.onerror = function () {
    setError(true);
    setTimeout(createWebSocket, 5000);
  };
}

// Lost Connection Message

function setError(value) {
  if (value) {
      document.getElementById('error').innerHTML = '❌';
      return;
  }
  document.getElementById('error').innerHTML = '✅';
}

// Event Listeners

document.getElementById('error').addEventListener("click", function () {
  socket.close()
  createWebSocket()
});

let graphToggle = localStorage.getItem("showingGraph") == "true";
document.getElementById("graphToggle").addEventListener("click", toggleGraph);
toggleGraph()

function toggleGraph() {
  graphToggle = !graphToggle;
  localStorage.setItem("showingGraph", !graphToggle);
  if (graphToggle) {
    document.getElementById("graph").style.display = "none";
    return;
  }
  document.getElementById("graph").style.display = "block";
}

// Graph Stuff

let dataLen = 10
let i = -50
let labels = Array.from({length: dataLen}, () => i += 5);

function initGraph(initData) {
  let data = {
    labels: labels,
    datasets: [{
      label: 'Temperature',
      data: initData,
      fill: false,
      borderColor: '#3861fb',
      tension: 0.1
    }]
  };
  
  let config = {
    type: 'line',
    data: data,
  };
  
  var ctx = document.getElementById('graph').getContext('2d');
  stackedLine = new Chart(ctx, config);
}


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
