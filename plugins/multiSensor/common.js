const common = require('../../src/common');

// Functions / Constants used my multiple files for this plugin
// Or just things I want to move out on index.js

/**
 * Types of Alerts
 */
const Type = {
    // If temp is not in the Whitelist, send an alert
    whiteList: 'whiteList',

    // If temp is in the Blacklist, send an alert
    blackList: 'blackList',

    // If the temp is between the min and max, send an alert
    between: 'between',

    // If the temp is above the max or below the min, send an alert
    outOf: 'outOf'
};

/**
 * Capatilize the first letter of each word
 * @param {string} name The name to capitalize
 * @returns {string} The capitalized name
 */
function niceName(name) {
    let working = name.toLowerCase().split(' ');
    working.forEach((e, i) => {
        working[i] = e[0].toUpperCase() + e.substr(1);
    });
    return working.join(' ');
}

/**
 * Get the data from backend server
 * @param {Object} config Global Config
 * @returns {Promise} The temp data from the backend server
 * @async
 */
function getData(config) {
    let sen = `http://${config.sensor.ip}:${config.sensor.port}`;
    return new Promise((resolve, reject) => {
        common
            .get(`${sen}/temp`)
            .then(data => {
                data = JSON.parse(data);
                lastData = data;
                resolve(data);
            })
            .catch(reject);
    });
}

module.exports = {
    Type,
    niceName,
    getData
};
