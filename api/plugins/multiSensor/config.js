const { Type } = require(`${__dirname}/common`);

// This config is kinda a mess, but it works.
const pluginConfig = {
    // The page the plugin will be served from
    // Ex multi would serve on [page]/multi
    mainPage: 'multi',

    // Temperature alerts
    alerts: {
        enabled: true,

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
            email: {
                enabled: false,

                // The email address to send the alert to
                sendTo: [''],

                // The email info of the sender address
                sender: {
                    service: 'gmail',
                    auth: {
                        user: '',
                        pass: ''
                    }
                }
            },

            // Send alerts through webhook
            // For Discord Only (For now...)
            webhook: {
                enabled: false,
                url: ''
            }
        }
    }
};

// No need to edit anything below this line

module.exports = { pluginConfig };
