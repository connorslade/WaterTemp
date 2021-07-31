const common = require('../../src/common');
const fs = require('fs');

// Simple API plugin for Water Temperature Monitor
// V1.4 By Connor Slade 7/11/2021

const pluginConfig = {
    cacheTime: 120000,
    docs: true
};

let cache = { history: {} };
let basePage = [];

function init() {
    // Load Api Info Page (Static Content)
    if (!pluginConfig.docs) return;
    basePage['index.html'] = fs.readFileSync(`${__dirname}/index.html`);
    basePage['index.css'] = fs.readFileSync(`${__dirname}/index.css`);
}

function api(app, wsServer, config) {
    // Get current temperature
    app.get('/api/temp', (req, res) => {
        common.log('🌐 GET: /api/temp', '', req.ip);
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/temp`,
                pluginConfig.cacheTime
            )
            .then(d => {
                data = JSON.parse(d[0]);
                res.send({ temp: data.temp, cached: d[1] });
            })
            .catch(err => {
                res.status(500);
                res.send({ error: err });
            });
    });

    // Get the temperature at a specific time
    app.get('/api/temp/:time', (req, res) => {
        common.log('🌐 GET: /api/temp/:time', '', req.ip);
        let time = new Date(parseInt(req.params.time) * 1000);
        let temp = null;
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/data/download`,
                pluginConfig.cacheTime
            )
            .then(d => {
                data = {};
                d[0].split('\n').forEach(e => {
                    if (e != 'time,temp')
                        data[parseInt(e.split(',')[0])] = parseFloat(
                            e.split(',')[1]
                        );
                });
                if (NaN in data) delete data[NaN];
                Object.keys(data).forEach(e => {
                    date = new Date(e * 1000);
                    if (date <= time) temp = data[e];
                });
                res.send({ temp: temp, cached: d[1] });
            })
            .catch(err => {
                res.status(500);
                res.send({ error: err });
            });
    });

    // Get temperature stats
    app.get('/api/stats', (req, res) => {
        common.log('🌐 GET: /api/stats', '', req.ip);
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/data/stats`,
                pluginConfig.cacheTime
            )
            .then(d => {
                data = JSON.parse(d[0]);
                res.send({
                    length: data.length,
                    mean: data.mean,
                    first: data.first,
                    last: data.last,
                    rate: data.rate,
                    max: data.max,
                    min: data.min,
                    cached: d[1]
                });
            })
            .catch(err => {
                res.status(500);
                res.send({ error: err });
            });
    });

    // Get temperature history
    app.get('/api/history', (req, res) => {
        common.log('🌐 GET: /api/history', '', req.ip);
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/data/download`,
                pluginConfig.cacheTime
            )
            .then(d => {
                if (d[1] && cache.history.length !== 0) {
                    res.send({ temp: cache.history, cached: true });
                    return;
                }
                data = {};
                let lines = d[0].split('\n');
                lines.forEach(e => {
                    if (e != 'time,temp')
                        data[parseInt(e.split(',')[0])] = parseFloat(
                            e.split(',')[1]
                        );
                });
                if (NaN in data) delete data[NaN];
                cache.history = data;
                res.send({ temp: data, cached: d[1] });
            });
        // .catch(err => {
        //     res.status(500);
        //     res.send({ error: err });
        // });
    });

    // Api Docs
    if (!pluginConfig.docs) return;
    app.get('/api', (req, res) => {
        common.log('🌐 GET: /api', '', req.ip);
        res.type('html');
        res.send(basePage['index.html']);
    });

    ['index.html', 'index.css'].forEach(file => {
        app.get(`/api/${file}`, (req, res) => {
            res.type(file.split('.')[1]);
            common.log('🌐 GET: /api/' + file, '', req.ip);
            res.send(basePage[file]);
        });
    });
}

module.exports = {
    loadThis: true,
    name: 'Simple Api',
    version: '1.4',
    disableDefaultApi: false,

    onInit: init,

    api: [api]
};
