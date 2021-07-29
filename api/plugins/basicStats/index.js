// Plugin to get stats on website visits

const fs = require('fs');

const common = require('../../src/common');

// Config for this plugin
const localConfig = {
    // 'Database' file
    dataFile: `${__dirname}/data/data.json`,

    // How often to save data to disk
    // As this is not critical, it is set to 5 minutes
    // saveInterval: 1000 * 60 * 5
    // DEBUG
    saveInterval: 1000 * 10
};

let newData = [];

function init() {
    if (!fs.existsSync(localConfig.dataFile)){
        fs.writeFileSync(localConfig.dataFile, '[]');
        common.log("📝 Created Analytics 'Database'");
    }
    setInterval(() => {
        // DEBUG
        console.log('Saving data...');
        let data = newData;
        newData = [];
        fs.readFile(localConfig.dataFile, 'utf8', (err, dataStr) => {
            if (err) common.log(`🛑 Error Reading Data File: ${err}`);
            let oldData = JSON.parse(dataStr);
            data = oldData.concat(data);
            fs.writeFile(localConfig.dataFile, JSON.stringify(data), err => {
                if (err) common.log(`🛑 Error Saving Data File: ${err}`);
            });
        });
    }, localConfig.saveInterval);
}

function api(app, wsServer, config) {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        newData.push({
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            date: new Date()
        });
        next();
    });
}

module.exports = {
    loadThis: true,
    name: 'Basic Analytics',
    version: '0.0',
    disableDefaultApi: false,

    onInit: init,
    api: [api]
};
