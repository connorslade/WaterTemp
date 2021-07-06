const http = require('http');

// Connect to the local temperature sensor
// By Connor Slade - V0.1
// 7/5/2021

const config = {
    sensor: {
        ip: 'localhost',
        port: 3030
    }
};

/**
 * Send a Get Request
 * @async
 * @param uri {String} The Uri to get
 * @returns {Promise<String>} Response
 */
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

function onInit() {
    get(`http://${config.sensor.ip}:${config.sensor.port}/test`)
        .then(data => {
            data = JSON.parse(data);
            console.log('✅ Connection with Sensor Server Initialized');
            console.log(`   ➥  ${data.message} - v${data.version}`);
        })
        .catch(e => console.log('❌ Connection with Sensor Server Failed', e));
}

//function api(app, wsServer, config) {}

module.exports = {
    loadThis: true,
    name: 'Temperature Interface',
    version: '0.1',
    disableDefaultApi: false,

    onInit: onInit,
    api: []
};
