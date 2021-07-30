// Example WaterTemp Plugin
// V1.0 By Connor Slade 4/28/2021
// This plugin is currently disabled in the Config File
// Enable it to see it in action

module.exports = {
    loadThis: true, // Tell Plugin Loader if it should load or ignore this plugin
    name: 'Hello World', // Plugin Name
    version: '1.0', // Plugin Version
    disableDefaultApi: false, // Disables all default Api Functions

    onInit: () => {
        // Function run once on plugin load
        // Lets console log some *very* important information
        common.log('Hello World :P');
    },

    api: [
        // Each function in this array will be loaded
        // app is express app
        // wsServer is WebSocket server
        // Config is loaded from config/config.json
        (app, wsServer, config, debug) => {
            app.get('/test', (req, res) => {
                // Example Express Get Function
                res.send('It Works!!!');
            });
        }
    ]
};
