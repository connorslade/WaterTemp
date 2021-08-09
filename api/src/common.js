const config = require('./../config/config.json');
const https = require('https');
const http = require('http');
const fs = require('fs');

// Init Cache
let cache = {};

/**
 * Send a Get Request
 * @async
 * @param {String} uri The Uri to get
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

/**
 * Send a POST request
 * @async
 * @param data {String} Json Data
 * @param hostname {string} Server Hostname
 * @param port {Number} Server Port
 * @param path {String} Resource Path
 * @returns {Promise<String>} Response
 */
function post(data, hostname, port, path) {
    return new Promise((resolve, reject) => {
        data = JSON.stringify(data);
        let options = {
            hostname: hostname,
            port: port,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        let req = https.request(options, res => {
            let todo = '';
            res.on('data', d => (todo += d));
            res.on('end', () => resolve(todo));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

/**
 * Pad a number to a certain length
 * @param {Number} n Number to pad
 * @param {Number} width The length to pad to
 * @param {Number} z Char to pad with
 * @returns {String} The padded number
 */
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/**
 * Pads an Ip Address for common.log
 * @param {String} n Ip address
 * @returns {String} The padded IP
 */
function ipPad(n) {
    return `(${n})${' '.repeat(15 - n.length)}`;
}

/**
 * Create Log file name
 * @param {String} format Logfile format, the first '#' is replaced with the date
 * @returns {String} The log file name
 */
function getLogFileName(format) {
    const today = new Date();
    const utcDay = today.getUTCDate();
    const utcMonth = today.getUTCMonth();
    const utcYear = today.getUTCFullYear();
    return format.replace('#', `${utcMonth}-${utcDay}-${utcYear}`);
}

/**
 * Add a line to the log file
 * @param {String} test The line to add
 * @returns {void}
 */
function addToLog(text) {
    let today = new Date();
    let datetime = `${this.pad(today.getHours(), 2)}:${this.pad(
        today.getMinutes(),
        2
    )}:${this.pad(today.getSeconds(), 2)}`;

    if (!config.log.enabled) return;
    fs.appendFile(
        this.getLogFileName(config.log.log),
        `[${datetime}] ${text}` + '\n',
        'utf8',
        err => {
            if (err) console.log('📜 Error writing to Log File :/');
        }
    );
}

/**
 * Console .log and add to log file
 * @param {String} type Event Type
 * @param {String} text Event Content
 * @param {String} ip Ip address
 * @returns {void}
 */
function log(type, text, ip) {
    let working = `${this.ipPad(ip || ' ')} ${type || ''} ${text || ''}`;

    console.log(working);
    this.addToLog(working);
}

/**
 * Averages the numbers in an array
 * @param {Array} arr Array to average
 * @returns {Number}
 */
function avg(arr) {
    let sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

/**
 * Get request but with a cache
 * @param {String} uri The Uri to get
 * @param {Number} cache Length to cache data (IN MS)
 * @returns {Promise<String>} Response
 */
function getData(url, cacheTime) {
    cacheTime = cacheTime || 120000;
    return new Promise((resolve, reject) => {
        if (url in cache && Date.now() - cache[url].time <= cacheTime)
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

/**
 * Stream a file on disk
 * @param {String} file Path of file to stream
 * @param {Function} res Response to pipe the file to
 * @returns {null}
 */
function streamFile(file, res) {
    let stream = fs.createReadStream(file);
    stream.on('open', () => stream.pipe(res));
    stream.on('error', err => res.end(err));
}

module.exports = {
    getLogFileName,
    streamFile,
    addToLog,
    getData,
    ipPad,
    post,
    pad,
    log,
    get,
    avg
};
