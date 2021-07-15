const common = require('../../src/common');
const fs = require('fs');

// System Status Plugin for Water temp system thing
// V0.3 By Connor Slade 7/11/2021

// Load Api Info Page
let basePage = [];
['index.html', 'error.html', 'index.css'].forEach(file => {
    basePage[file] = fs.readFileSync(`./plugins/getData/${file}`).toString();
});

function api(app, wsServer, config) {
    // Serve some static files
    ['index.css'].forEach(file => {
        app.get(`/data/${file}`, (req, res) => {
            res.type(file.split('.')[1]);
            common.log('✨ GET: /data/' + file, '', req.ip);
            res.send(basePage[file]);
        });
    });

    app.get('/data', (req, res) => {
        common.log('✨ GET: /data', '', req.ip);
        common
            .getData(`http://${config.sensor.ip}:${config.sensor.port}/data/stats`)
            .then(data => {
                data = JSON.parse(data[0]);
                let dataSize = Math.round(10 + (9 + data.length * 28) / 1024);
                let page = basePage['index.html']
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
            .catch(err =>
                res.send(basePage['error.html'].replace(/{ERROR}/g, err))
            );
    });
}

function download(app, wsServer, config) {
    app.get('/data/download.csv', (req, res) => {
        common.log('✨ GET: /data/download.csv', '', req.ip);
        res.header('Content-Type', 'text/csv');
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/data/download`
            )
            .then(data => res.send(data[0]))
            .catch(err =>
                res.send(basePage['error.html'].replace(/{ERROR}/g, err))
            );
    });

    app.get('/data/download.json', (req, res) => {
        common.log('✨ GET: /data/download.json', '', req.ip);
        res.header('Content-Type', 'application/json');
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/data/download`
            )
            .then(data => {
                let json = {};
                data[0].split('\n').forEach(e => {
                    let items = e.split(',');
                    json[items[0]] = items[1];
                });
                res.send(JSON.stringify(json));
            })
            .catch(err =>
                res.send(basePage['error.html'].replace(/{ERROR}/g, err))
            );
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
