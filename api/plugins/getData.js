const http = require('http');
const common = require('../src/common');

// System Status Plugin for Water temp system thing
// V0.2 By Connor Slade 7/11/2021

const sensor = {
    ip: 'localhost',
    port: 3030
};

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

const basePage = `
<!DOCTYPE html>
<html>
<head>
    <title>Get Data - V0.2</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="index.css">
    <style>
        body * {
            text-align: center;
            font-family: Arial,sans-serif;
            margin: 0;
            margin-top: 0;
        }
    </style>
</head>
<body style="font-family: Arial,sans-serif;">
    <h1 style="margin: 16px;">Get Data</h1>
    <br>
    <h2><i class="fa fa-code"></i> Data Stats</h2>
    <p><i class="fa fa-area-chart"></i> Data Points: {DATA_POINTS}</p>
    <p><i class="fa fa-clock-o"></i> Data Rate: {DATA_RATE}/h</p>
    <p><i class="fa fa-cogs"></i> Total Mean: {DATA_MEAN}°F</p>
    <p><i class="fa fa-hourglass-start"></i> Data Start: {DATE_S}</p>
    <p><i class="fa fa-hourglass-end"></i> Data End: {DATA_E}</p>

    <br>
    <h2><i class="fa fa-database"></i> Download Data ({DATA_SIZE} kb)</h2>
    <a href="/data/download.csv" download="TemperatureData.csv">
    <button class="btn"><i class="fa fa-download"></i> Download CSV</button>
    </a>
    <a href="/data/download.json" download="TemperatureData.json">
    <button class="btn"><i class="fa fa-download"></i> Download JSON</button>
    </a><br>
    <h2><i class="fa fa-code"></i> Access API</h2>
    <p>This water temperature system thing <br>has a public api. Learn more <a href="/api">here</a>.</p>
    <div class="footer">
        <p class="footer-content">© Connor Slade · 2021 · V0.2 · <a href="https://github.com/Basicprogrammer10/WaterTemp">Github</a> · <a href="/">Home</a></p>
    </div>
</body>
</html>
`;

const errorPage = `
<!DOCTYPE html>
<html>
<head>
    <title>Error</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="index.css">
    <style>
        body * {
            text-align: left;
            font-family: Arial,sans-serif;
            margin: 0;
        }
        code {
            padding: 2px 4px;
            font-size: 90%;
            color: #c7254e;
            background-color: #f9f2f4;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <h1 style="text-align: center;">Error 😓</h1>
    <br>
    <p>There was an error processing your request.</p>
    <p>This problem was likely caused by the sensor server being down...</p>
    <p>If the problem persists, please contact me at <a href="mailto:water@connorcode.com?subject=Error with Get Data Site&body={ERROR}">water@connorcode.com</a>.</p>
    <br>
    <p><strong>ERROR INFO:</strong> <code>{ERROR}</code></p>
    <div class="footer">
        <p class="footer-content">©Connor Slade · 2021 · V0.2 · <a href="https://github.com/Basicprogrammer10/WaterTemp">Github</a> · <a href="/">Home</a></p>
    </div>
</body>
</html>
`;

function api(app, wsServer, config) {
    app.get('/data', (req, res) => {
        common.log('✨ GET: /data', '', req.ip);
        get(`http://${sensor.ip}:${sensor.port}/data/stats`)
            .then(data => {
                data = JSON.parse(data);
                let dataSize = Math.round(10 + (9 + data.length * 28) / 1024);
                let page = basePage
                    .replace('{DATA_POINTS}', data.length)
                    .replace('{DATA_RATE}', data.rate)
                    .replace('{DATA_MEAN}', Math.round(data.mean * 1000) / 1000)
                    .replace(
                        '{DATE_S}',
                        new Date(data.first * 1000).toDateString()
                    )
                    .replace(
                        '{DATA_E}',
                        new Date(data.last * 1000).toDateString()
                    )
                    .replace('{DATA_SIZE}', dataSize);
                res.send(page);
            })
            .catch(err => res.send(errorPage.replace(/{ERROR}/g, err)));
    });
}

function download(app, wsServer, config) {
    app.get('/data/download.csv', (req, res) => {
        common.log('✨ GET: /data/download.csv', '', req.ip);
        res.header('Content-Type', 'text/csv');
        get(`http://${sensor.ip}:${sensor.port}/data/download`)
            .then(data => res.send(data))
            .catch(err => res.send(errorPage.replace(/{ERROR}/g, err)));
    });

    app.get('/data/download.json', (req, res) => {
        common.log('✨ GET: /data/download.json', '', req.ip);
        res.header('Content-Type', 'application/json');
        get(`http://${sensor.ip}:${sensor.port}/data/download`)
            .then(data => {
                let json = {};
                data.split('\n').forEach(e => {
                    let items = e.split(',');
                    json[items[0]] = items[1];
                });
                res.send(JSON.stringify(json));
            })
            .catch(err => res.send(errorPage.replace(/{ERROR}/g, err)));
    });
}

module.exports = {
    loadThis: true,
    name: 'Get Data',
    version: '0.2',
    disableDefaultApi: false,

    onInit: () => {},

    api: [api, download]
};
