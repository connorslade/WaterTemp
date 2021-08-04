// Plugin for showing data from multiple sensors

const fs = require('fs');

const common = require('../../src/common');
const { Type, niceName, getData } = require(`${__dirname}/common`);
const sendAlert = require(`${__dirname}/alert`);

// Load Config
const { pluginConfig } = require(`${__dirname}/config`);

// Init some variables
let sensorInAlert = [];
let lastData = {};
let sockets = [];
let staticFiles;

// Plugin init
function init() {
    staticFiles = fs.readdirSync(`${__dirname}/static`);
}

// Check if sensor data is in range
// If not, send an alert
// TODO: Multi Sensor Support
function checkRange(data, config) {
    if (!config.alerts.enabled) return;
    let alert = {};

    data.all.forEach(sensor => {
        let temp = sensor.temp;

        // Check if the temperature is ok
        config.alerts.alerts.forEach(e => {
            if (e.sensorId !== sensor.id && e.sensorId !== '*') return;
            console.log(`Checking ${JSON.stringify(sensor)}`);
            if (!Object.keys(alert).includes(e.name)) alert[e.name] = [];
            switch (e.type) {
                case Type.whiteList:
                    if (e.values.includes(temp)) alert[e.name].push(sensor);
                    break;

                case Type.blackList:
                    if (!e.values.includes(temp)) alert[e.name].push(sensor);
                    break;

                case Type.between:
                    if (temp >= e.values[0] || temp <= e.values[1])
                        alert[e.name].push(sensor);
                    break;

                case Type.outOf:
                    if (temp < e.values[0] || temp > e.values[1])
                        alert[e.name].push(sensor);
                    break;
            }
            if (
                Object.keys(alert).length === 0 ||
                (!Object.keys(alert).includes(e.name) &&
                    !alert[e.name].includes(sensor))
            ) {
                console.log('should remove');
                delete sensorInAlert[sensor.id];
                console.log(sensorInAlert);
            }
            if (alert[e.name].length === 0) delete alert[e.name];
        });
    });
    console.log(alert);
    console.log(sensorInAlert);
    // Return if there are no alerts
    if (Object.keys(alert).length === 0) return;
    console.log('try Send');

    // Gernerate the text to send
    let text = '';
    Object.keys(alert).forEach(a => {
        alert[a].forEach(e => {
            if (sensorInAlert.includes(e.id)) return;
            else sensorInAlert.push(e.id);
            text += `${a} - ${niceName(e.name)} - ${
                Math.round(e.temp * 1000) / 1000
            }°F\n`;
        });
    });

    // Send the alerts!
    if (text === '') return;
    common.log(`🚨 Sensor Alert: ${text}`);

    if (config.alerts.alertMessage.webhook.enabled) {
        sendAlert.discord(
            {
                embeds: [
                    {
                        title: ':thermometer: Sensor Alert',
                        description: text,
                        color: 154877
                    }
                ]
            },
            config
        );
    }

    if (config.alerts.alertMessage.email.enabled) {
        sendAlert.email(
            `Tempature Alert for ${Object.keys(alert).join(', ')}`,
            text,
            config
        );
    }
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
