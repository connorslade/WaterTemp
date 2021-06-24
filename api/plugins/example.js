// Example WebChecklist Plugin
// V1.0 By Connor Slade 4/28/2021
// This plugin is currently disabled in the Config File
// Enable it to see it in action


module.exports = {
    loadThis: true, // Tell Plugin Loader if it should load or ignore this plugin
    name: 'Hello World', // Plugin Name
    version: '1.0', // Plugin Version
    disableDefaultApi: false, // Disables all default Api Functions

    onInit: function () { // Function run once on plugin load
        // common.log is like console.log but it has extra formatting
        // and adds the output to the log file
        console.log("Hello World :P");
    },

    api: [ // Each function in this array will be loaded
        // app is express app
        // wsServer is WebSocket server
        // Config is loaded from config/config.json
        function (app, wsServer, config) {
            app.get('/test', function (req, res) { // Example Express Get Function
                res.send('It Works!!!');
            });
        }
    ]
}