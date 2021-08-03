var socket;
function main() {
    createWebSocket();
}
function createWebSocket() {
    var wsProto = 'ws';
    if (location.protocol === 'https:')
        wsProto = 'wss';
    socket = new WebSocket(wsProto + "://" + window.location.href.split('/')[2]);
    // Tell server we want the data for all the sensors
    socket.onopen = function () {
        console.log('WebSocket opened');
        socket.send('multiSensor');
    };
    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        console.log(data);
        switch (data.event) {
            case 'multi_update':
                showData(data.data);
                break;
            case 'multi_init':
                showData(data.data);
                break;
        }
    };
    socket.onclose = function (event) {
        if (event.wasClean)
            return;
        if (event.code === 1000)
            return;
        setTimeout(createWebSocket, 5000);
    };
    socket.onerror = function () {
        setTimeout(createWebSocket, 5000);
    };
}
function getTempElementData(id, name, temp, unit) {
    return "<div class=\"sensor\" id=\"" + id + "\">\n        <i class=\"fa fa-thermometer-full\"></i>\u2000<p class=\"name\">" + name + "</p>\n        <p class=\"temp\">" + temp + "\u00B0" + unit + "</p>\n    </div>";
}
function niceName(name) {
    var working = name.toLowerCase().split(' ');
    working.forEach(function (e, i) {
        working[i] = e[0].toUpperCase() + e.substr(1);
    });
    return working.join(' ');
}
function showData(data) {
    var mainElement = document.getElementById('values');
    var shownDevices = [];
    for (var i = 0; i < mainElement.children.length; i++) {
        shownDevices.push(mainElement.children[i].id);
    }
    data.all.forEach(function (e) {
        var temp = Math.round(e.temp * 100) / 100;
        if (shownDevices.includes(e.id)) {
            var sensor = document.getElementById(e.id);
            sensor.outerHTML = getTempElementData(e.id, niceName(e.name), temp, 'F');
            return;
        }
        mainElement.innerHTML += getTempElementData(e.id, niceName(e.name), temp, 'F');
    });
}
window.onload = main;
