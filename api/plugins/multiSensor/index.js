// Plugin for showing data from multiple sensors

const fs = require('fs');

const common = require('../../src/common');
const { Type } = require(`${__dirname}/common`);
const sendAlert = require(`${__dirname}/alert`);

// Load Config
const { pluginConfig } = require(`${__dirname}/config`);

// Init some variables
let sockets = [];
let staticFiles;
let lastData = {};

function init() {
    staticFiles = fs.readdirSync(`${__dirname}/static`);
}

// Capatilize the first letter of each word
function niceName(name) {
    let working = name.toLowerCase().split(' ');
    working.forEach((e, i) => {
        working[i] = e[0].toUpperCase() + e.substr(1);
    });
    return working.join(' ');
}

// Get the data from backend server
function getData(config) {
    let sen = `http://${config.sensor.ip}:${config.sensor.port}`;
    return new Promise((resolve, reject) => {
        common
            .get(`${sen}/temp`)
            .then(data => {
                data = JSON.parse(data);
                lastData = data;
                resolve(data);
            })
            .catch(reject);
    });
}

// Check if sensor data is in range
// If not, send an alert
// TODO: Multi Sensor Support
function checkRange(data, config) {
    let alert = {};

    data.all.forEach(sensor => {
        let temp = sensor.temp;

        // Check if the temperature is ok
        config.alerts.alerts.forEach(e => {
            switch (e.type) {
                case Type.whiteList:
                    if (!(e.name in alert)) alert[e.name] = [];
                    if (e.values.includes(temp)) alert[e.name].push(sensor);
                    break;

                case Type.blackList:
                    if (!(e.name in alert)) alert[e.name] = [];
                    if (!e.values.includes(temp)) alert[e.name].push(sensor);
                    break;

                case Type.between:
                    if (!(e.name in alert)) alert[e.name] = [];
                    if (temp >= e.values[0] || temp <= e.values[1])
                        alert[e.name].push(sensor);
                    break;

                case Type.outOf:
                    if (!(e.name in alert)) alert[e.name] = [];
                    if (temp < e.values[0] || temp > e.values[1])
                        alert[e.name].push(sensor);
                    break;
            }
        });
    });

    // Return if there are no alerts
    if (alert.length === 0) return;

    // Gernerate the text to send
    let text = '';
    Object.keys(alert).forEach(a => {
        alert[a].forEach(e => {
            text += `${a} - ${niceName(e.name)} - ${
                Math.round(e.temp * 1000) / 1000
            }°F\n`;
        });
    });

    Object.keys(alert).forEach(key => {
        // Send the alerts!
        if (config.alerts.alertMessage.webhook) {
            console.log(
                `:thermometer: Sensor Alert${
                    alert.length > 1 ? 's' : ''
                }\n${text}`
            );
            sendAlert.discord(
                {
                    content: `:thermometer: Sensor Alert${
                        alert.length > 1 ? 's' : ''
                    }\n${text}`
                },
                config
            );
        }

        // Comming Soon to a alert system near you!
        // mabye.
        if (config.alerts.alertMessage.email.enabled) {
            sendAlert.email(
                `Tempature Alert for ${Object.keys(alert).join(', ')}`,
                text,
                config
            );
        }
    });
}

// Define routes for sending data
function api(app, wsServer, config, debug) {
    wsServer.on('connection', socket => {
        socket.on('message', message => {
            if (message === 'multiSensor' && !sockets.includes(socket)) {
                sockets.push(socket);

                socket.send(
                    JSON.stringify({
                        event: 'multi_init',
                        data: lastData
                    })
                );
            }
        });

        socket.on('close', () => {
            sockets = sockets.filter(s => s !== socket);
        });
    });

    setInterval(() => {
        getData(config).then(data => {
            let tosend = JSON.stringify({
                event: 'multi_update',
                data: data
            });
            sockets.forEach(s => s.send(tosend));
            checkRange(data, pluginConfig);
        });
    }, 5000);
}

// Define routes for static files
function static(app, wsServer, config, debug) {
    staticFiles.forEach(file => {
        app.get(`/${pluginConfig.mainPage}/${file}`, (req, res) => {
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

// TODO
// Add Cypress Tests
// Show when WS disconnects
// Unit Changing
// Show Averages
// ✔ Webhook ALerts
// Add Embeds to discord webhook
// ✔ Email Alerts
// Only send alert once per time it enters range
// idk
