const common = require('../../src/common');
const fs = require('fs');

// System Status Plugin for Water temp system thing
// V0.7 By Connor Slade 7/11/2021

// Init variable for storing reformated csv data
let cache = [{}, {}];

// Init variable for storing static html pages
let basePage = [];

function dataUnit(sizeKB) {
    let units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;
    while (sizeKB > 1024) {
        if (unitIndex + 1 > units.length) break;
        sizeKB /= 1024;
        unitIndex++;
    }
    return `${sizeKB.toFixed(2)} ${units[unitIndex]}`;
}

function init() {
    // Load Api Info Page
    ['index.html', 'error.html', 'index.css'].forEach(file => {
        basePage[file] = fs.readFileSync(`${__dirname}/${file}`).toString();
    });
}

function api(app, wsServer, config, debug) {
    // Serve some static files
    let toServe = ['index.css'];
    if (debug) toServe.push('error.html');
    toServe.forEach(file => {
        app.get(`/data/${file}`, (req, res) => {
            res.type(file.split('.')[1]);
            common.log('✨ GET: /data/' + file, '', req.ip);
            res.send(basePage[file]);
        });
    });

    app.get('/data', (req, res) => {
        common.log('✨ GET: /data', '', req.ip);
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/data/stats`
            )
            .then(data => {
                data = JSON.parse(data[0]);
                let dataSize = 10 + (9 + data.length * 50.47);
                let page = basePage['index.html']
                    .replace('{DATA_POINTS}', data.length)
                    .replace('{DATA_RATE}', data.rate)
                    .replace('{DATA_MEAN}', Math.round(data.mean * 1000) / 1000)
                    .replace('{DATA_MIN}', Math.round(data.min * 1000) / 1000)
                    .replace('{DATA_MAX}', Math.round(data.max * 1000) / 1000)
                    .replace(
                        '{DATE_S}',
                        new Date(data.first * 1000).toDateString()
                    )
                    .replace(
                        '{DATA_E}',
                        new Date(data.last * 1000).toDateString()
                    )
                    .replace('{DATA_SIZE}', dataUnit(dataSize));
                res.send(page);
            })
            .catch(err => {
                res.send(basePage['error.html'].replace(/{ERROR}/g, err));
                common.log('🚨 Error: ', err, req.ip);
            });
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
            .then(data => {
                if (!data[1] || Object.keys(cache[0]).length === 0) {
                    data = data[0];
                    data = data.split('\n');
                    data.shift();
                    data.pop();
                    data.forEach((e, i) => {
                        e = e.split(',');
                        e.push(e[1]);
                        e[1] = new Date(e[0] * 1000)
                            .toLocaleString()
                            .replace(',', '');
                        data[i] = e.join(',');
                    });
                    data.unshift('epoch,time,temp');
                    cache[0] = data;
                }
                res.send(cache[0].join('\n'));
            })
            .catch(err => {
                res.send(basePage['error.html'].replace(/{ERROR}/g, err));
                common.log('🚨 Error: ', err, req.ip);
            });
    });

    app.get('/data/download.json', (req, res) => {
        common.log('✨ GET: /data/download.json', '', req.ip);
        res.header('Content-Type', 'application/json');
        common
            .getData(
                `http://${config.sensor.ip}:${config.sensor.port}/data/download`
            )
            .then(data => {
                if (!data[1] || Object.keys(cache[1]).length === 0) {
                    data[0].split('\n').forEach(e => {
                        let items = e.split(',');
                        cache[1][items[0]] = items[1];
                    });
                }
                res.send(cache[1]);
            })
            .catch(err => {
                res.send(basePage['error.html'].replace(/{ERROR}/g, err));
                common.log('🚨 Error: ', err, req.ip);
            });
    });
}

module.exports = {
    loadThis: true,
    name: 'Get Data',
    version: '0.7',
    disableDefaultApi: false,

    onInit: init,

    api: [api, download]
};
