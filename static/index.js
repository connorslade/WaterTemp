const units = ['°F', '°C', '°K'];
const convert = [c => c, c => (c - 32) * (5 / 9), c => (c + 459.67) * (5 / 9)];

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

let graphToggle = localStorage.getItem('showingGraph') == 'true';
let extraGraph = localStorage.getItem('extraGraph') == 'true';
let currentIdex = parseInt(localStorage.getItem('unit'));

// Unit Changing

/**
 * Convert Temp °F to other units
 * @param {Number} index Unit index
 * @param {Number} tmp Temperature in °F
 */
function convertUnit(index, tmp) {
    return Math.round(convert[index](tmp) * 10) / 10;
}

function processUnitChange() {
    currentIdex += 1;
    if (currentIdex >= units.length) currentIdex = 0;
    localStorage.setItem('unit', currentIdex);

    document.getElementById('unit').innerHTML = `<p>${units[currentIdex]}</p>`;
    document.getElementById('temp').innerHTML = convertUnit(currentIdex, tmp);
    document.getElementById('avg').innerHTML = convertUnit(currentIdex, avg);
    document.getElementById('dev').innerHTML = Math.abs(
        Math.round(
            (convertUnit(currentIdex, avg) - convertUnit(currentIdex, tmp)) * 10
        ) / 10
    );
}

document.getElementById('unit').innerHTML = `<p>${units[currentIdex]}</p>`;
['click', 'keydown'].forEach(event => {
    document.getElementById('unit').addEventListener(event, e => {
        if ('key' in e && e.key !== 'Enter') return;
        processUnitChange();
        document.getElementById('unit').blur();
    });
});

// Align Top Boxes

let boxes = document.getElementsByClassName('unit');
let acu = 5;
Object.keys(boxes).forEach(e => {
    boxes[e].style.marginRight = `${acu}px`;
    acu += 47;
});

// Update Data

/**
 * Update Ui Data
 * @param {Number} tmp Temperature in F
 * @param {Number} avg Average Temperature in F
 */
function updateData(tmp, avg) {
    document.getElementById('temp').innerHTML = convertUnit(currentIdex, tmp);
    document.getElementById('avg').innerHTML = convertUnit(currentIdex, avg);
    document.getElementById('dev').innerHTML = Math.abs(
        Math.round(
            (convertUnit(currentIdex, avg) - convertUnit(currentIdex, tmp)) * 10
        ) / 10
    );

    if (stackedLine === null) return;
    addData(stackedLine, '?', tmp);
    removeData(stackedLine);
}

// Websocket Init

window.onload = () => createWebSocket();

/**
 * Init the Web Socket
 */
function createWebSocket() {
    let wsProto = 'ws';
    if (location.protocol === 'https:') wsProto = 'wss';
    socket = new WebSocket(
        `${wsProto}://${window.location.href.split('/')[2]}`
    );

    socket.onopen = () => setError(false);

    socket.onmessage = event => {
        let data = JSON.parse(event.data);
        console.log(data);
        switch (data.event) {
            case 'update':
                updateData(data.tmp, data.avg);
                break;

            case 'init':
                initGraph(data.data);
                updateData(data.tmp, data.avg);
                break;
        }
    };

    socket.onclose = event => {
        if (event.wasClean) return;
        if (event.code === 1000) return;
        setError(true);
        setTimeout(createWebSocket, 5000);
    };

    socket.onerror = () => {
        setError(true);
        setTimeout(createWebSocket, 5000);
    };
}

// Lost Connection Message

/**
 * Show / Hide Error Message
 * @param {Boolean} value True if error. False if no error.
 */
function setError(value) {
    if (value) document.getElementById('error').innerHTML = '<p>❌</p>';
    else document.getElementById('error').innerHTML = '<p>✅</p>';
}

// Event Listeners

// On Click Error Button
document.getElementById('error').addEventListener('click', () => {
    socket.close();
    createWebSocket();
    document.getElementById('error').blur();
});

document.getElementById('error').addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    socket.close();
    createWebSocket();
    document.getElementById('error').blur();
});

/**
 * Run on Window Resize and set Chart Height.
 */
function processSizeChange() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (h >= w) document.getElementById('graphDiv').style.height = `35%`;
    else document.getElementById('graphDiv').style.height = `90%`;
}
window.addEventListener('resize', () => processSizeChange(), true);
processSizeChange();

// On Click Graph Button
document.getElementById('graphToggle').addEventListener('click', toggleGraph);
document.getElementById('graphToggle').addEventListener('keydown', e => {
    if (e.key === 'Enter') toggleGraph();
});
toggleGraph();

/**
 * Toggle if Graph is showing
 */
function toggleGraph() {
    graphToggle = !graphToggle;
    document.getElementById('graphToggle').blur();
    localStorage.setItem('showingGraph', !graphToggle);
    if (graphToggle) {
        document.getElementById('graph').style.display = 'none';
        return;
    }
    document.getElementById('graph').style.display = 'block';
    processSizeChange();
}

// Graph Stuff

let dataLen = 10;
let i = -50;
let labels = Array.from({ length: dataLen }, () => (i += 5));

/**
 * @param {Array} initData Data to start graph with
 * @param {Boolean} extraGraph True if extra graph info is showing. False if not.
 */
function initGraph(initData, extraGraph) {
    extraGraph = extraGraph || false;
    let data = {
        labels: labels,
        datasets: [
            {
                label: 'Temperature °F',
                data: initData,
                fill: false,
                borderColor: '#3861fb',
                tension: 0.1
            }
        ]
    };

    let config = {
        data: data,
        type: 'line',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false || extraGraph
                    }
                },
                y: {
                    grid: {
                        display: false || extraGraph
                    }
                }
            },
            plugins: {
                legend: {
                    display: false || extraGraph
                }
            }
        }
    };

    var ctx = document.getElementById('graph').getContext('2d');
    if (stackedLine !== null) stackedLine.destroy();
    stackedLine = new Chart(ctx, config);
}

/**
 * @param {Object} chart Chart to add data to
 * @param {String]} label Label for data
 * @param {Number} data Data to add
 */
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach(dataset => {
        dataset.data.push(data);
    });
    chart.update();
}

/**
 * Remove data from chart.
 * Removes the first bit of data from the chart. (data.shift())
 * @param {Object} chart Chart to remove data from
 */
function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach(dataset => {
        dataset.data.shift();
    });
    chart.update();
}
