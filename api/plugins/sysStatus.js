const os = require('os');
const common = require('../src/common');

// System Status Plugin for Water temp system thing
// V1.1 By Connor Slade 7/9/2021

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

const basePage = `
<!DOCTYPE html>
<html>
<head>
    <title>System Status - V1.1</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="index.css">
    <style>
        body * {
            text-align: left;
            font-family: Arial,sans-serif;
            margin: 0;
            margin-top: 0;
        }
        .title {
            text-align: center;
        }
        .fa {
            margin-left: 30px;
        }
        .cat {
            margin-left: 0;
        }
    </style>
</head>
<body style="font-family: Arial,sans-serif;">
    <h1 class="title">System Status</h1>
    <p class="title">By Connor Slade :P</p>
    <h2><i class="cat fa fa-snowflake-o"></i> Web Server</h2>
    <p><i class="fa fa-code-fork"></i> <strong>Version:</strong> {VERSION}</p>
    <p><i class="fa fa-lock"></i> <strong>TLS:</strong> {TLS}</p>
    <p><i class="fa fa-globe"></i> <strong>IP:</strong> {IP}</p>
    <p><i class="fa fa-window-maximize"></i> <strong>Port:</strong> {PORT}</p>
    <p><i class="fa fa-linux"></i> <strong>System:</strong> {SYSTEM}</p>
    <p><i class="fa fa-clock-o"></i> <strong>Uptime:</strong> {UPTIME}</p>
    <p><i class="fa fa-plug"></i> <strong>Plugins:</strong> {PLUGINS}</p>

    <h2><i class="cat fa fa-microchip"></i> Sensor Status</h2>
    <p><i class="fa fa-check"></i> <strong>Connected:</strong> {S_CONNECTED}</p>
    <p><i class="fa fa-code-fork"></i> <strong>Version:</strong> {S_VERSION}</p>
    <p><i class="fa fa-comment"></i> <strong>Message:</strong> {S_MESSAGE}</p>
    <p><i class="fa fa-wrench"></i> <strong>Last Update:</strong> {S_LAST_UPDATE}</p>
    <p><i class="fa fa-thermometer-half"></i> <strong>Temperature:</strong> {S_TEMP}</p>
</body>
</html>
`;

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
            .replace('{TLS}', config.server.tls.enabled ? 'Enabled' : 'Disabled')
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
    version: '1.0',
    disableDefaultApi: false,

    onInit: () => {},

    api: [api]
};
