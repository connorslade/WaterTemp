const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const express = require('express');
const ws = require("ws");
const fs = require('fs');

const config = {
    server: {
        ip: "0.0.0.0",
        port: 8080
    }
}

const wsServer = new ws.Server({noServer: true});
const app = express();
app.use(express.static('./../stadic/'));
//if (config.server.rateLimit.enabled) app.use(rateLimit({
//    windowMs: config.server.rateLimit.window,
//    max: config.server.rateLimit.max
//}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());


let sockets = [];
wsServer.on('connection', socket => {
    socket.on('message', message => common.log("🔌 WebSocket", message, socket._socket.remoteAddress));
    socket.on('close', function () {
        console.log(`❌ WebSocket Disconnected ${socket._socket.remoteAddress}`);
        sockets = sockets.filter(s => s !== socket);
    });
    sockets.push(socket);
    setInterval(function() {
        let toSend = `{"tmp": ${Math.floor(Math.random() * 10)}, "avg": ${Math.floor(Math.random() * 10)}}`;
        socket.send(toSend);
        //sockets.forEach(s => s.send(toSend));
      }, 5000);
})


app.listen(config.server.port, config.server.ip, function () {
    console.log(`🐍 Serving http://${config.server.ip}:${config.server.port}/`);
})
    .on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
            console.log(`✔ WebSocket Connected`, '', socket._socket.remoteAddress);
        });
    });
