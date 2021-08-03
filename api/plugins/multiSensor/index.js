// Plugin for showing data from multiple sensors

const fs = require('fs');

const common = require('../../src/common');

// Config
const pagePath = 'multi';

// Init some variables
let sockets = [];
let staticFiles;
let data;

function undefOrNull(value) {
    return value === undefined || value === null;
}

function init() {
    staticFiles = fs.readdirSync(`${__dirname}/static`);
}

// Define routes for sending data
function api(app, wsServer, config, debug) {
    wsServer.on('connection', socket => {
        socket.on('message', message => {
            if (message === 'multiSensor' && !sockets.includes(socket)) {
                sockets.push(socket);

                if (undefOrNull(global.raw_sensor_data)) {
                    socket.send(JSON.stringify({ event: 'multi_init' }));
                    return;
                }

                socket.send(
                    JSON.stringify({
                        event: 'multi_init',
                        data: global.raw_sensor_data
                    })
                );
            }
        });

        socket.on('close', () => {
            sockets = sockets.filter(s => s !== socket);
        });
    });

    setInterval(() => {
        sockets.forEach(s => {
            if (undefOrNull(global.raw_sensor_data)) {
                s.send(JSON.stringify({ event: 'multi_update' }));
                return;
            }
            s.send(
                JSON.stringify({
                    event: 'multi_update',
                    data: global.raw_sensor_data
                })
            );
        });
    }, 5000);
}

// Define routes for static files
function static(app, wsServer, config, debug) {
    staticFiles.forEach(file => {
        app.get(`/${pagePath}/${file}`, (req, res) => {
            common.streamFile(`${__dirname}/static/${file}`, res);
        });
    });

    app.get('/multi', (req, res) => {
        common.streamFile(`${__dirname}/static/index.html`, res);
    });
}

module.exports = {
    loadThis: true,
    name: 'Multi Sensor',
    version: '0.1',
    disableDefaultApi: false,

    onInit: init,
    api: [api, static]
};
