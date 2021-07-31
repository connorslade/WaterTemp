// Plugin to redirect http traffic to https
// Auto Enables if is TLS is enabled :P

const rateLimit = require('express-rate-limit');
const express = require('express');

const common = require('../src/common');

// Config for this Server
// (This starts another web server and uses it to redirect traffic)
const localConfig = {
    ip: '0.0.0.0',
    port: 80
};

function api(app, wsServer, config) {
    // Start a new WebServer on plugin load
    if (!config.server.tls.enabled) return;
    const httpServer = express();
    if (config.server.rateLimit.enabled)
        httpServer.use(
            rateLimit({
                windowMs: config.server.rateLimit.window,
                max: config.server.rateLimit.max
            })
        );

    httpServer
        .use((req, res) => {
            common.log('🏮 Redirecting Http Traffic', '', req.ip);
            res.redirect('https://' + req.headers.host + req.url);
        })
        .listen(localConfig.port, localConfig.ip, () => {
            common.log(
                `🐍 Serving http://${localConfig.ip}:${localConfig.port}/`
            );
        });
}

module.exports = {
    loadThis: true,
    name: 'HTTP support',
    version: '0.2',
    disableDefaultApi: false,

    onInit: () => {},
    api: [api]
};
