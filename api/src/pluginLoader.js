const common = require('./common');
const fs = require('fs');

function loadPlugin(file, command) {
    if (!command.loadThis) return false;
    common.log(`🍞 Loading ${file} v${command.version}`);
    plugin = {
        name: command.name,
        disable: command.disableDefaultApi,
        init: command.onInit,
        api: command.api,
        version: command.version
    };
    return plugin;
}

function load(folder, config) {
    if (!config['plugins']['loadPlugins']) return;
    let plugins = {};
    let loadedPlugins = 0;
    common.log('🔌 Loading Plugins');
    const commandFiles = fs
        .readdirSync(folder)
        .filter(file => file.endsWith('.js'));

    const commandFolders = fs
        .readdirSync(folder, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (const file of commandFiles) {
        if (config['plugins']['disabledPlugins'].includes(file)) continue;
        const command = require(`../${folder}/${file}`);
        const plugin = loadPlugin(file, command);
        if (!plugin) continue;
        loadedPlugins++;
        plugins[file] = plugin;
    }

    for (const pluginFolder of commandFolders) {
        if (config['plugins']['disabledPlugins'].includes(pluginFolder)) continue;
        const command = require(`../${folder}/${pluginFolder}/index`);
        const plugin = loadPlugin(pluginFolder, command);
        if (!plugin) continue;
        loadedPlugins++;
        plugins[pluginFolder] = plugin;
    }

    common.log(`🔌 ${loadedPlugins} plugins loaded`);
    if (loadedPlugins > 0) runInits(plugins);
    global.plugins = plugins;
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
