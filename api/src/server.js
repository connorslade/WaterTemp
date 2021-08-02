const config = require('./../config/config.json');

const rateLimit = require('express-rate-limit');
const express = require('express');
const common = require('./common');
const https = require('https');
const ws = require('ws');
const fs = require('fs');

const wsServer = new ws.Server({ noServer: true });
const app = express();

// Allow accessing raw body data of requests
app.use((req, res, next) => {
    var data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
        req.rawBody = data;
        next();
    });
});

/**
 *  Setup Server
 * @param {Object} plugins Plugins to load
 * @param {Boolean} debug Debug mode
 */
function init(plugins, debug) {
    // Debug mode
    if (debug)
        app.get('/EXIT', (req, res) => {
            res.send('ok');
            common.log('🛑 Server is exiting...');
            process.exit(0);
        });

    // Add Rate-Limiting
    if (config.server.rateLimit.enabled && !debug)
        app.use(
            rateLimit({
                windowMs: config.server.rateLimit.window,
                max: config.server.rateLimit.max
            })
        );

    // Load plugins
    let loadDefault = true;
    for (const key in plugins) {
        if ('disable' in plugins[key])
            if (plugins[key].disable) loadDefault = false;
        if ('api' in plugins[key]) {
            for (const fun in plugins[key].api) {
                plugins[key].api[fun](app, wsServer, config, debug);
            }
        }
    }

    // Serve static content
    if (config.server.static.serveStatic)
        app.use(express.static(config.server.static.staticFolder));

    if (!loadDefault) return;
    common.log('🚓 Loading default API');
    require('./routes').webSocket(wsServer, debug);
}

/**
 *  Start Server Http
 */
function start(ip, port) {
    app.listen(config.server.port, config.server.ip, () =>
        common.log(`🐍 Serving http://${ip}:${port}/`)
    ).on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
            common.log(
                `✅️ WebSocket Connected`,
                '',
                socket._socket.remoteAddress
            );
        });
    });
}

/**
 *  Start Server Https
 */
// prettier-ignore
function startTls(ip, port) {
    let key = fs.readFileSync(config.server.tls.key);
    let cert = fs.readFileSync(config.server.tls.cert);
    https.createServer({ key: key, cert: cert }, app)
        .listen(port, ip, () =>
            common.log(`🐍 Serving https://${ip}:${port}/`)
        ).on('upgrade', (request, socket, head) => {
            wsServer.handleUpgrade(request, socket, head, socket => {
                wsServer.emit('connection', socket, request);
                common.log(
                    `✅️ WebSocket Connected`,
                    '',
                    socket._socket.remoteAddress
                );
            });
        });
}

module.exports = {
    startTls,
    start,
    init
};
