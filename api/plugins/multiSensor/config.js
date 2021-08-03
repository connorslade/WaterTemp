const { Type } = require(`${__dirname}/common`);

// This config is kinda a mess, but it works.
const pluginConfig = {
    // The page the plugin will be served from
    // Ex multi would serve on [page]/multi
    mainPage: 'multi',

    // Temperature alerts
    alerts: {
        enabled: false,

        // Define as many alerts as you want
        // They will be checked every 5 seconds
        alerts: [
            {
                // The alert name will be used to identify the alert
                // It is used to tell you which alert has been triggered
                // Each name must be unique or bad things will happen
                name: 'Temperature Alert',
                // The sensor that the alert runs for
                // If it is set to '*' it will run for all sensors
                sensorId: '*',
                // Every alert needs a type
                // This defines what kind of alert it is
                // Options: whiteList, blackList, between, outOf
                type: Type.outOf,

                // Define the values for the alert
                // For between and outOf, the values are [min, max]
                // For whiteList and blackList, the values are a list of values
                values: [0, 0]
            }
        ],

        alertMessage: {
            // Send alerts through email
            // Comming Soon...
            email: {
                enabled: false,

                // The email address to send the alert to
                sendTo: [],

                // The email info of the sender address
                sender: {
                    email: '',
                    password: ''
                }
            },
            
            // Send alerts through webhook
            // Intended for Discord, may work elsewhere
            webhook: {
                enabled: true,
                url: 'https://discord.com/api/webhooks/844410249288482826/ze8PzNzgUq7Yg3_Vbm32YpEH11toqgAxOJV0P81s5rd8ABdkGy81VJA9vQTDT1NutIW0'
            }
        }
    }
};

// No need to edit anything below this line

module.exports = { pluginConfig, Type };
