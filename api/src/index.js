const config = require('./../config/config.json');
const pluginLoader = require('./pluginLoader');
const server = require('./server');

console.log(`💧 Starting Water Temp Server! v${config.version}`);

server.init(pluginLoader.load('plugins', config));
if (config.server.tls.enabled) server.startTls();
if (!config.server.tls.enabled) server.start();
