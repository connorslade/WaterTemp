const common = require('../src/common');
const http = require('http');

// Connect to the local temperature sensor
// By Connor Slade - V1.1
// 7/5/2021

const config = {
    sensor: {
        ip: 'localhost',
        port: 3030
    }
};

let history = Array.from({ length: 10 }, () => 0);

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
            history.push(data.temp);
            history.shift();
            global.sensor_data = [(new Date).toLocaleTimeString(), data.temp]
            let toSend = {
                event: event,
                tmp: data.temp,
                // avg: avg(data.history)
                avg: avg(history)
            }
            // if (event === 'init') toSend.data = data.history;
            if (event === 'init') toSend.data = history;
            resolve(JSON.stringify(toSend));
        }).catch(reject);
    });
}

function onInit() {
    get(`http://${config.sensor.ip}:${config.sensor.port}/test`)
        .then(data => {
            data = JSON.parse(data);
            common.log('✅ Connection with Sensor Server Initialized');
            common.log(`   ➥  ${data.message} - v${data.version}`);
            global.sensor_state = [true, data.version, data.message]
        })
        .catch(e => {
            common.log('❌ Connection with Sensor Server Failed', e);
            global.sensor_state = [false, 'N/A', e]
        });
}

function api(app, wsServer) {
    app;
    let sockets = [];
    wsServer.on('connection', socket => {
        socket.on('message', message =>
            common.log('🔌 WebSocket', '', message, socket._socket.remoteAddress)
        );
        socket.on('close', function () {
            common.log(
                '❌ WebSocket Disconnected', '', socket._socket.remoteAddress
            );
            sockets = sockets.filter(s => s !== socket);
        });
        sockets.push(socket);
        getData('init').then(data => socket.send(data));
    });

    setInterval(function () {
        getData('update').then(data => sockets.forEach(socket => socket.send(data))).catch(e => common.log('❌ Error', e));
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
