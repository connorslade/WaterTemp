const units = ['°F', '°C', '°K'];
const convert = [
    (c: number): number => c,
    (c: number): number => (c - 32) * (5 / 9),
    (c: number): number => (c + 459.67) * (5 / 9)
];

let stackedLine: any = null;
let socket: any = null;
let tmp: number = 30;
let avg: number = 10;

// Persistent Settings

if (localStorage.getItem('setup') === null) {
    localStorage.setItem('setup', 'true');
    localStorage.setItem('showingGraph', 'false');
    localStorage.setItem('unit', '0');
}

let graphToggle = localStorage.getItem('showingGraph') == 'true';
let extraGraph = localStorage.getItem('extraGraph') == 'true';
let currentIndex = parseInt(localStorage.getItem('unit'));

// Unit Changing

/**
 * Convert Temp °F to other units
 * @param {Number} index Unit index
 * @param {Number} tmp Temperature in °F
 */
function convertUnit(index: number, tmp: number, string: boolean = true): any {
    let math = Math.round(convert[index](tmp) * 10) / 10;
    if (string) return math.toString();
    else return math;
}

/**
 * Get the difference between current temperature and average temperature.
 * @param {Number} currentIndex Unit Index
 * @param {Number} tmp Temperature in °F
 * @param {Number} avg Average Temperature in °F
 * @returns {Number} Dev
 */
function getTempDev(currentIndex: number, tmp: number, avg: number): number {
    return Math.abs(
        Math.round(
            (convertUnit(currentIndex, avg, false) -
                convertUnit(currentIndex, tmp, false)) *
                10
        ) / 10
    );
}

function processUnitChange() {
    currentIndex += 1;
    if (currentIndex >= units.length) currentIndex = 0;
    localStorage.setItem('unit', currentIndex.toString());

    document.getElementById('unit').innerHTML = `<p>${units[currentIndex]}</p>`;
    document.getElementById('temp').innerHTML = convertUnit(currentIndex, tmp);
    document.getElementById('avg').innerHTML = convertUnit(currentIndex, avg);
    document.getElementById('dev').innerHTML = getTempDev(
        currentIndex,
        tmp,
        avg
    ).toString();
}

document.getElementById('unit').innerHTML = `<p>${units[currentIndex]}</p>`;
['click', 'keydown'].forEach(event => {
    document.getElementById('unit').addEventListener(event, (e: any) => {
        if ('key' in e && e.key !== 'Enter') return;
        processUnitChange();
        document.getElementById('unit').blur();
    });
});

// Align Top Boxes

let boxes = document.getElementsByClassName('unit');
let acu = 5;
Object.keys(boxes).forEach((e: any) => {
    // @ts-ignore
    boxes[e].style.marginRight = `${acu}px`;
    acu += 47;
});

// Update Data

/**
 * Update Ui Data
 * @param {Number} tmp Temperature in F
 * @param {Number} avg Average Temperature in F
 */
function updateData(tmp: number, avg: number) {
    document.getElementById('temp').innerHTML = convertUnit(currentIndex, tmp);
    document.getElementById('avg').innerHTML = convertUnit(currentIndex, avg);
    document.getElementById('dev').innerHTML = getTempDev(
        currentIndex,
        tmp,
        avg
    ).toString();

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

    socket.onmessage = (event: any) => {
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

    socket.onclose = (event: any) => {
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
function setError(value: boolean) {
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
    localStorage.setItem('showingGraph', (!graphToggle).toString());
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
function initGraph(initData: Object, extraGraph: boolean = false) {
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

    // @ts-ignore
    var ctx = document.getElementById('graph').getContext('2d');
    if (stackedLine !== null) stackedLine.destroy();
    // @ts-ignore
    stackedLine = new Chart(ctx, config);
}

/**
 * @param {Object} chart Chart to add data to
 * @param {String]} label Label for data
 * @param {Number} data Data to add
 */
function addData(chart: any, label: string, data: number) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset: any) => {
        dataset.data.push(data);
    });
    chart.update();
}

/**
 * Remove data from chart.
 * Removes the first bit of data from the chart. (data.shift())
 * @param {Object} chart Chart to remove data from
 */
function removeData(chart: any) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset: any) => {
        dataset.data.shift();
    });
    chart.update();
}
