const common = require('../src/common');
const http = require('http');
const fs = require('fs');

// Simple API plugin for Water Temperature Monitor
// V1.1 By Connor Slade 7/11/2021

const pluginConfig = {
    ip: 'localhost',
    port: 3030,
    cacheTime: 120000,
    docs: true
};

// Load Api Info Page
const basePage = fs.readFileSync('./plugins/simpleApi/apiInfo.html', {
    encoding: 'utf8',
    flag: 'r'
});

// Get Request
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

let cache = {};

function getData(url) {
    return new Promise((resolve, reject) => {
        if (
            url in cache &&
            Date.now() - cache[url].time <= pluginConfig.cacheTime
        )
            resolve([cache[url].data, true]);
        else {
            get(url)
                .then(data => {
                    cache[url] = { data: data, time: Date.now() };
                    resolve([data, false]);
                })
                .catch(reject);
        }
    });
}

function api(app, wsServer, config) {
    app.get('/api', (req, res) => {
        common.log('🌐 GET: /api', '', req.ip);
        if (pluginConfig.docs) res.send(basePage);
        else res.status(404).send('404 Not Found');
    });

    // Get current temperature
    app.get('/api/temp', (req, res) => {
        common.log('🌐 GET: /api/temp', '', req.ip);
        getData(`http://${pluginConfig.ip}:${pluginConfig.port}/temp`)
            .then(d => {
                data = JSON.parse(d[0]);
                res.send({ temp: data.temp, cached: d[1] });
            })
            .catch(err => {
                res.status(500);
                res.send({ error: err });
            });
    });

    // Get temperature history
    app.get('/api/history', (req, res) => {
        common.log('🌐 GET: /api/history', '', req.ip);
        getData(`http://${pluginConfig.ip}:${pluginConfig.port}/data/download`)
            .then(d => {
                data = {};
                let lines = d[0].split('\n');
                lines.forEach(e => {
                    if (e != 'time,temp')
                        data[parseInt(e.split(',')[0])] = parseFloat(
                            e.split(',')[1]
                        );
                });
                if (NaN in data) delete data[NaN];
                res.send({ temp: data, cached: d[1] });
            })
            .catch(err => {
                res.status(500);
                res.send({ error: err });
            });
    });
}

module.exports = {
    loadThis: true,
    name: 'Simple Api',
    version: '1.1',
    disableDefaultApi: false,

    onInit: () => {},

    api: [api]
};