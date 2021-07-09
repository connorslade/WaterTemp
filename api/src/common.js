const config = require('./../config/config.json');
const fs = require('fs');

module.exports = {
    pad: function (n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width
            ? n
            : new Array(width - n.length + 1).join(z) + n;
    },
    ipPad: function (n) {
        return `(${n})${' '.repeat(15 - n.length)}`;
    },
    getLogFileName: function (format) {
        const today = new Date();
        const utcDay = today.getUTCDate();
        const utcMonth = today.getUTCMonth();
        const utcYear = today.getUTCFullYear();
        return format.replace('#', `${utcMonth}-${utcDay}-${utcYear}`);
    },
    addToLog: function (text) {
        let today = new Date();
        let datetime = `${this.pad(today.getHours(), 2)}:${this.pad(
            today.getMinutes(),
            2
        )}:${this.pad(today.getSeconds(), 2)}`;

        if (!config.log.enabled) return;
        fs.appendFile(
            this.getLogFileName(config.log.log),
            `[${datetime}] ${text}` + '\n',
            'utf8',
            function (err) {
                if (err) console.log('📜 Error writing to Log File :/');
            }
        );
    },
    log: function (type, text, ip) {
        let working = `${this.ipPad(ip || ' ')} ${type || ''} ${text || ''}`;

        console.log(working);
        this.addToLog(working);
    }
};
