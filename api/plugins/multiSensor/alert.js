const common = require('../../src/common');

function discord(alert, config) {
    let splitUrl = config.alerts.alertMessage.webhook.url.split('/');
    common
        .post(
            alert,
            splitUrl[2],
            443,
            `/${splitUrl.slice(3).join('/')}`
        )
        .catch(err => {
            console.log(`🛑 Error Sending Webhook: ${err}`);
        });
}

module.exports = { discord };
