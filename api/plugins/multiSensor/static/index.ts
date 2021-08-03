let socket;

function main() {
    createWebSocket();
}

function createWebSocket() {
    let wsProto = 'ws';
    if (location.protocol === 'https:') wsProto = 'wss';
    socket = new WebSocket(
        `${wsProto}://${window.location.href.split('/')[2]}`
    );

    // Tell server we want the data for all the sensors
    socket.onopen = () => {
        console.log('WebSocket opened');
        socket.send('multiSensor');
    };

    socket.onmessage = (event: any) => {
        let data = JSON.parse(event.data);
        console.log(data);
        switch (data.event) {
            case 'multi_update':
                showData(data.data, false);
                break;

            case 'multi_init':
                showData(data.data, true);
                break;
        }
    };

    socket.onclose = (event: any) => {
        if (event.wasClean) return;
        if (event.code === 1000) return;
        setTimeout(createWebSocket, 5000);
    };

    socket.onerror = () => {
        setTimeout(createWebSocket, 5000);
    };
}

function getTempElementData(id, name, temp, unit) {
    return `<div class="sensor" id="${id}">
        <i class="fa fa-thermometer-full"></i> <p class="name">${name}</p>
        <p class="temp">${temp}°${unit}</p>
    </div>`
}

function niceName(name: string) {
    let working = name.toLowerCase().split(' ');
    working.forEach((e, i) => {
        working[i] = e[0].toUpperCase() + e.substr(1);
    });
    return working.join(' ');
}

function showData(data, init: boolean) {
    let mainEle = document.getElementById('values');
    if (init) {
        data.all.forEach(e => {
            let temp = Math.round(e.temp * 100) / 100;
            mainEle.innerHTML += getTempElementData(e.id, niceName(e.name), temp, 'F');
        });
        return
    }
    data.all.forEach(e => {
        let sensor = document.getElementById(e.id);
        let temp = Math.round(e.temp * 100) / 100;
        sensor.outerHTML = getTempElementData(e.id, niceName(e.name), temp, 'F');
    });
}

window.onload = main;
