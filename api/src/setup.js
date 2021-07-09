const config = require('./../config/config.json');
const common = require('./common');
const fs = require('fs');

function createLogFolder() {
    let dir = 'log';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
        common.log("📜 Created Log Folder");
    }
}

module.exports = {
    setup: () => {
        createLogFolder();
    }
}