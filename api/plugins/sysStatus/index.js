const os = require('os');
const fs = require('fs');

const common = require('../../src/common');

// System Status Plugin for Water temp system thing
// V1.2 By Connor Slade 7/9/2021

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);
    return (
        ('0' + h).slice(-2) +
        ':' +
        ('0' + m).slice(-2) +
        ':' +
        ('0' + s).slice(-2)
    );
}

// Define some global variables

// [Connected, Version, Message]
global.sensor_state = [false, 'N/A', ''];

// [Last Update, Temperature]
global.sensor_data = ['N/A', 'N/A'];

const basePage = fs.readFileSync(`${__dirname}/basePage.html`, 'utf8');

function api(app, wsServer, config) {
    app.get('/status', (req, res) => {
        common.log('✨ GET: /status', '', req.ip);
        let plugins = [];
        Object.keys(global.plugins).forEach(e =>
            plugins.push(
                `${global.plugins[e].name} [${global.plugins[e].version}]`
            )
        );
        let formatPage = basePage
            .replace('{VERSION}', config.version)
            .replace(
                '{TLS}',
                config.server.tls.enabled ? 'Enabled' : 'Disabled'
            )
            .replace('{IP}', config.server.ip)
            .replace('{PORT}', config.server.port)
            .replace('{SYSTEM}', os.type())
            .replace('{UPTIME}', secondsToHms(os.uptime()))
            .replace('{PLUGINS}', plugins.join(', '))

            .replace('{S_CONNECTED}', global.sensor_state[0] ? 'Yes' : 'No')
            .replace('{S_VERSION}', global.sensor_state[1])
            .replace('{S_MESSAGE}', global.sensor_state[2])
            .replace('{S_LAST_UPDATE}', global.sensor_data[0])
            .replace('{S_TEMP}', global.sensor_data[1] + '°F');
        res.send(formatPage);
    });
}

module.exports = {
    loadThis: true,
    name: 'System Status',
    version: '1.2',
    disableDefaultApi: false,

    onInit: () => {},

    api: [api]
};
