const debug = process.argv.slice(2).includes('--debug');
const config = require('./../config/config.json');
const pluginLoader = require('./pluginLoader');
const server = require('./server');

console.log(`💧 Starting Water Temp Server! v${config.version}`);
if (debug) console.log(`💦 Debug mode enabled!`);

// Init the plugin loader
server.init(pluginLoader.load('plugins', config), debug);

// TLS
if (config.server.tls.enabled)
    server.startTls(config.server.ip, config.server.port);

// No TLS :(
if (!config.server.tls.enabled)
    server.start(config.server.ip, config.server.port);
