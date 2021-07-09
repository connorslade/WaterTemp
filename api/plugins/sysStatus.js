const os = require('os');
const common = require('../src/common');
const config = require('../config/config.json');

// System Status Plugin for Water temp system thing
// V1.0 By Connor Slade 7/9/2021

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
}

// Define some global variables

// [Connected, Version, Message]
global.sensor_state = [false, 'N/A', ''];

// [Last Update, Temperature]
global.sensor_data = ['N/A', 'N/A'];

const basePage =
`
<!DOCTYPE html>
<html>
<head>
    <title>System Status</title>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial,sans-serif;">
    <h1>System Status</h1>
    <p>By Connor Slade :P</p>
    <h2>Web Server</h2>
    <p>Version: {VERSION}</p>
    <p>TLS: {TLS}</p>
    <p>IP: {IP}</p>
    <p>Port: {PORT}</p>
    <p>System: {SYSTEM}</p>
    <p>Uptime: {UPTIME}</p>

    <h2>Sensor Status</h2>
    <p>Connected: {S_CONNECTED}</p>
    <p>Version: {S_VERSION}</p>
    <p>Message: {S_MESSAGE}</p>
    <p>Last Update: {S_LAST_UPDATE}</p>
    <p>Temperature: {S_TEMP}</p>
</body>
</html>
`

function api(app, wsServer, config) {
    app.get('/status', (req, res) => {
        common.log('✨ GET: /status', '', req.ip)
        formatPage = basePage
        .replace('{VERSION}', config.version)
        .replace('{TLS}', config.server.tls.enabled ? 'Enabled' : 'Disabled')
        .replace('{IP}', config.server.ip)
        .replace('{PORT}', config.server.port)
        .replace('{SYSTEM}', os.type())
        .replace('{UPTIME}', secondsToHms(os.uptime()))
        
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
    version: '1.0',
    disableDefaultApi: false,

    onInit: () => {},

    api: [api]
};
