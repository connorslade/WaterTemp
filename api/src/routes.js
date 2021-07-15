const config = require('../config/config.json');
const common = require('./common');

// Create new array to hold history data
let history = Array.from({ length: 10 }, () => 0);

/**
 * Gets Init Data for Websocket Clients
 * @param {String} event Event Type
 * @returns {String}
 */
function getData(event) {
    return new Promise((resolve, reject) => {
        common
            .get(`http://${config.sensor.ip}:${config.sensor.port}/temp`)
            .then(data => {
                data = JSON.parse(data);
                history.push(data.temp);
                history.shift();
                global.sensor_data = [
                    new Date().toLocaleTimeString(),
                    data.temp
                ];
                let toSend = {
                    event: event,
                    tmp: data.temp,
                    avg: common.avg(history)
                };
                if (event === 'init') toSend.data = history;
                resolve(JSON.stringify(toSend));
            })
            .catch(reject);
    });
}

/**
 * Run at to confirm connection with sensor server
 * @returns {void}
 */
function init() {
    common
        .get(`http://${config.sensor.ip}:${config.sensor.port}/test`)
        .then(data => {
            data = JSON.parse(data);
            common.log('✅ Connection with Sensor Server Initialized');
            common.log(`   ➥  ${data.message} - v${data.version}`);
            global.sensor_state = [true, data.version, data.message];
        })
        .catch(e => {
            common.log('❌ Connection with Sensor Server Failed', e);
            global.sensor_state = [false, 'N/A', e];
        });
}

/**
 * WebSocket route for debug mode
 * @returns {void}
 */
function debugWebSocket(wsServer) {
    let sockets = [];
    wsServer.on('connection', socket => {
        socket.on('message', message =>
            common.log('🔌 WebSocket', message, socket._socket.remoteAddress)
        );
        socket.on('close', () => {
            common.log(
                `❌ WebSocket Disconnected ${socket._socket.remoteAddress}`
            );
            sockets = sockets.filter(s => s !== socket);
        });
        sockets.push(socket);
        socket.send(
            JSON.stringify({
                event: 'init',
                data: Array.from({ length: 10 }, () =>
                    Math.floor(Math.random() * 10)
                ),
                tmp: Math.floor(Math.random() * 10),
                avg: Math.floor(Math.random() * 10)
            })
        );
    });

    setInterval(() => {
        let toSend = `{"event": "update", "tmp": ${Math.floor(
            Math.random() * 10
        )}, "avg": ${Math.floor(Math.random() * 10)}}`;
        sockets.forEach(s => s.send(toSend));
    }, 5000);
}

function webSocket(wsServer, debug) {
    init();
    if (debug) {
        debugWebSocket(wsServer);
        return;
    }
    let sockets = [];
    wsServer.on('connection', socket => {
        socket.on('message', message =>
            common.log(
                '🔌 WebSocket',
                '',
                message,
                socket._socket.remoteAddress
            )
        );
        socket.on('close', function () {
            common.log(
                '❌ WebSocket Disconnected',
                '',
                socket._socket.remoteAddress
            );
            sockets = sockets.filter(s => s !== socket);
        });
        sockets.push(socket);
        getData('init').then(data => socket.send(data));
    });

    setInterval(function () {
        getData('update')
            .then(data => sockets.forEach(socket => socket.send(data)))
            .catch(e => common.log('❌ Error', e));
    }, 5000);
}

module.exports = {
    webSocket: webSocket
};
