module.exports = {
    webSocket: wsServer => {
        let sockets = [];
        wsServer.on('connection', socket => {
            socket.on('message', message =>
                common.log(
                    '🔌 WebSocket',
                    message,
                    socket._socket.remoteAddress
                )
            );
            socket.on('close', function () {
                console.log(
                    `❌ WebSocket Disconnected ${socket._socket.remoteAddress}`
                );
                sockets = sockets.filter(s => s !== socket);
            });
            sockets.push(socket);
            socket.send(
                JSON.stringify({
                    event: 'init',
                    data: Array.from({ length: 10 }, () =>
                        Math.floor(Math.random() * 10)
                    ),
                    tmp: Math.floor(Math.random() * 10),
                    avg: Math.floor(Math.random() * 10)
                })
            );
        });

        // DEBUG stuff
        setInterval(function () {
            let toSend = `{"event": "update", "tmp": ${Math.floor(
                Math.random() * 10
            )}, "avg": ${Math.floor(Math.random() * 10)}}`;
            sockets.forEach(s => s.send(toSend));
        }, 5000);
    }
};
