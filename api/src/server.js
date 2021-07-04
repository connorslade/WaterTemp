const config = require('./../config/config.json');

const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const express = require('express');
const ws = require('ws');

const wsServer = new ws.Server({ noServer: true });
const app = express();
if (config.server.static.serveStatic)
    app.use(express.static(config.server.static.staticFolder));
if (config.server.rateLimit.enabled)
    app.use(
        rateLimit({
            windowMs: config.server.rateLimit.window,
            max: config.server.rateLimit.max
        })
    );
app.use(bodyParser.json());

module.exports = {
    init: function (plugins, debug) {
        if (debug)
            app.get('/EXIT', (req, res) => {
                res.send('ok');
                console.log('[*] Server is exiting...');
                process.exit(0);
            });

        let loadDefault = true;
        for (const key in plugins) {
            if ('disableDefaultApi' in plugins[key])
                if (plugins[key].disableDefaultApi) loadDefault = false;
            if ('api' in plugins[key]) {
                for (const fun in plugins[key].api) {
                    plugins[key].api[fun](app, wsServer, config);
                }
            }
        }
        if (!loadDefault) return;
        require('./routes').webSocket(wsServer, config);
    },

    start: function () {
        app.listen(config.server.port, config.server.ip, function () {
            console.log(
                `🐍 Serving http://${config.server.ip}:${config.server.port}/`
            );
        }).on('upgrade', (request, socket, head) => {
            wsServer.handleUpgrade(request, socket, head, socket => {
                wsServer.emit('connection', socket, request);
                console.log(
                    `✔ WebSocket Connected`,
                    '',
                    socket._socket.remoteAddress
                );
            });
        });
    }
};
