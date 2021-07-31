// Plugin to get stats on website visits
// Version 0.3 By Connor Slade :P

const fs = require('fs');
const crypto = require('crypto');

const common = require('../../src/common');

// Config for this plugin
const localConfig = {
    // 'Database' file
    // Storing data like this is kind of a bad idea but clearly not bad enough to stop me
    dataFile: `${__dirname}/data/data.json`,

    // How often to save data to disk
    // As this is not critical, it is set to 10 minutes
    saveInterval: 1000 * 60 * 10,

    // Enables an api to get stats remotely
    // Requires a key to be set in the config
    publicApi: {
        enabled: false,

        // The key is a sha256 hash of the key you want to use
        // When making a request, the key will be sent in the header 'auth'
        key: '2f3e0736b8e4fb1a4e14c809640f3cf6108ec4ba473338263140396a0637c3f3'
    },

    // Specifies what extra data to save about each request
    saveData: {
        // Request Body (As String)
        data: true
    },

    // Enable Debug Mode
    // Will print extra info to console
    debug: false
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
        if (newData.length === 0) return;
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

function api(app, wsServer, config, debug) {
    // If in debug mode, use known values for testing
    if (debug) {
        localConfig.publicApi.enabled = true;
        localConfig.key =
            '2f3e0736b8e4fb1a4e14c809640f3cf6108ec4ba473338263140396a0637c3f3';
    }

    // Log some info about each request made to the server
    app.use((req, res, next) => {
        if (localConfig.debug)
            common.log(
                `🔁 REQUEST`,
                `${req.method} ${req.url} ${req.rawBody}`,
                req.ip
            );

        // Push data to buffer thing
        let data = {
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            data: null,
            date: new Date()
        };
        if (localConfig.saveData.data) data.data = req.rawBody;
        newData.push(data);
        next();
    });

    // Optional Public API
    if (!localConfig.publicApi.enabled) return;
    app.get('/analytics', (req, res) => {
        if (!('auth' in req.headers)) {
            res.status(401).send('Unauthorized');
            return;
        }
        let sha256 = crypto.createHash('sha256');
        sha256.update(req.headers.auth, 'utf8');
        if (sha256.digest('hex') !== localConfig.publicApi.key) {
            res.status(401).send('Incorrect Auth Key');
            return;
        }
        fs.readFile(localConfig.dataFile, 'utf8', (err, dataStr) => {
            if (err) common.log(`🛑 Error Reading Data File: ${err}`);
            res.send({
                time: new Date(),
                version: 0.2,
                data: JSON.parse(dataStr).concat(newData)
            });
        });
    });
}

module.exports = {
    loadThis: true,
    name: 'Basic Analytics',
    version: '0.3',
    disableDefaultApi: false,

    onInit: init,
    api: [api]
};
