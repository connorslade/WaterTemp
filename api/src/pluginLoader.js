// PLUGIN LOADER
// By Connor Slade :P

const common = require('./common');
const fs = require('fs');

// Load a plugin
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

// Find plugins
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

    for (const pluginFolder of commandFolders) {
        if (config['plugins']['disabledPlugins'].includes(pluginFolder))
            continue;
        if (!fs.existsSync(`${folder}/${pluginFolder}/index.js`)) continue;
        const command = require(`../${folder}/${pluginFolder}/index`);
        const plugin = loadPlugin(pluginFolder, command);
        if (!plugin) continue;
        loadedPlugins++;
        plugins[pluginFolder] = plugin;
    }

    for (const file of commandFiles) {
        if (config['plugins']['disabledPlugins'].includes(file)) continue;
        const command = require(`../${folder}/${file}`);
        const plugin = loadPlugin(file, command);
        if (!plugin) continue;
        loadedPlugins++;
        plugins[file] = plugin;
    }

    common.log(`🔌 ${loadedPlugins} plugins loaded`);
    if (loadedPlugins > 0) runInits(plugins);
    global.plugins = plugins;
    return plugins;
}

// Run plugin init functions
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

// Inject API function of plugins
function inject(plugins, inject) {
    let loadDefault = true;
    for (const key in plugins) {
        if ('disable' in plugins[key])
            if (plugins[key].disable) loadDefault = false;
        if ('api' in plugins[key]) {
            for (const fun in plugins[key].api) {
                inject(plugins[key].api[fun]);
            }
        }
    }
    return { loadDefault };
}

module.exports = {
    load,
    inject
};
