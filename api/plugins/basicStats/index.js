// Plugin to get stats on website visits
// Version 0.0 By Connor Slade :P

const fs = require('fs');

const common = require('../../src/common');

// Config for this plugin
const localConfig = {
    // 'Database' file
    // Storing data like this is kind of a bad idea but clearly not bad enough to stop me
    dataFile: `${__dirname}/data/data.json`,

    // How often to save data to disk
    // As this is not critical, it is set to 10 minutes
    saveInterval: 1000 * 60 * 5,

    // Enable Debug Mode
    // Will print extra info to console
    debug: true
};

let newData = [];

function init() {
    // Create a new data file if it does not exist
    if (!fs.existsSync(localConfig.dataFile)) {
        fs.writeFileSync(localConfig.dataFile, '[]');
        common.log("📝 Created Analytics 'Database'");
    }

    // Save data to disk every x minutes
    setInterval(() => {
        if (localConfig.debug) common.log('💾 Saving analytics data...');
        let data = newData;
        newData = [];

        // Load Old data
        fs.readFile(localConfig.dataFile, 'utf8', (err, dataStr) => {
            if (err) common.log(`🛑 Error Reading Data File: ${err}`);
            let oldData = JSON.parse(dataStr);
            data = oldData.concat(data);

            // Save all data to disk
            fs.writeFile(localConfig.dataFile, JSON.stringify(data), err => {
                if (err) common.log(`🛑 Error Saving Data File: ${err}`);
            });
        });
    }, localConfig.saveInterval);
}

function api(app, wsServer, config) {
    // Log some info about each request made to the server
    app.use((req, res, next) => {
        if (localConfig.debug)
            common.log(`🔁 REQUEST`, `${req.method} ${req.url}`, req.ip);

        // Push data to buffer thing
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
