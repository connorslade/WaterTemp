const common = require('./common');
const fs = require('fs');

function load(folder, config) {
    if (!config['plugins']['loadPlugins']) return;
    let plugins = {};
    let loadedPlugins = 0;
    common.log('🔌 Loading Plugins');
    const commandFiles = fs
        .readdirSync(folder)
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        if (config['plugins']['disabledPlugins'].includes(file)) continue;
        const command = require(`../${folder}/${file}`);
        if (!command.loadThis) continue;
        common.log(`🍞 Loading ${file} v${command.version}`);
        loadedPlugins++;
        plugins[file] = {
            name: command.name,
            disable: command.disableDefaultApi,
            init: command.onInit,
            api: command.api
        };
    }
    common.log(`🔌 ${loadedPlugins} plugins loaded`);
    if (loadedPlugins > 0) runInits(plugins);
    return plugins;
}

function runInits(plugins) {
    common.log('👆 Initializing Plugins');
    for (const key in plugins) {
        try {
            plugins[key].init();
        } catch (e) {
            // Ignore Errors
            // Like a REAL MAN
        }
    }
}

module.exports = {
    load
};
