const http = require('http');

// Connect to the local temperature sensor
// By Connor Slade - V1.0
// 7/5/2021

const config = {
    sensor: {
        ip: 'localhost',
        port: 3030
    }
};

/**
 * Send a Get Request
 * @async
 * @param {String} uri The Uri to get
 * @returns {Promise<String>} Response
 */
function get(uri) {
    return new Promise((resolve, reject) => {
        let req = http.get(uri, response => {
            let data = '';
            response.on('data', chunk => (data += chunk));
            response.on('end', () => resolve(data));
        });
        req.on('error', reject);
    });
}

/**
 * Averages the numbers in an array
 * @param {Array} arr Array to average
 * @returns {Number}
 */
function avg(arr) {
    let sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

/**
 * Gets Init Data for Websocket Clients
 * @param {String} event Event Type
 * @returns {String}
 */
function getData(event) {
    return new Promise((resolve, reject) => {
        get(`http://${config.sensor.ip}:${config.sensor.port}/temp`).then(data => {
            data = JSON.parse(data);
            let toSend = {
                event: event,
                tmp: data.temp,
                avg: avg(data.history)
            }
            if (event === 'init') toSend.data = data.history;
            resolve(JSON.stringify(toSend));
        }).catch(reject);
    });
}

function onInit() {
    get(`http://${config.sensor.ip}:${config.sensor.port}/test`)
        .then(data => {
            data = JSON.parse(data);
            console.log('✅ Connection with Sensor Server Initialized');
            console.log(`   ➥  ${data.message} - v${data.version}`);
        })
        .catch(e => console.log('❌ Connection with Sensor Server Failed', e));
}

function api(app, wsServer) {
    app;
    let sockets = [];
    wsServer.on('connection', socket => {
        socket.on('message', message =>
            common.log('🔌 WebSocket', message, socket._socket.remoteAddress)
        );
        socket.on('close', function () {
            console.log(
                `❌ WebSocket Disconnected ${socket._socket.remoteAddress}`
            );
            sockets = sockets.filter(s => s !== socket);
        });
        sockets.push(socket);
        getData('init').then(data => socket.send(data));
    });

    setInterval(function () {
        getData('update').then(data => sockets.forEach(socket => socket.send(data)));
    }, 5000);
}

module.exports = {
    loadThis: true,
    name: 'Temperature Interface',
    version: '1.0',
    disableDefaultApi: true,

    onInit: onInit,
    api: [api]
};
