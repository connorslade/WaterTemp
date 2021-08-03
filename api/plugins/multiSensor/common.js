// Functions / Constants used my multiple files for this plugin

/**
 * Types of Alerts
 */
const Type = {
    // If temp is not in the Whitelist, send an alert
    whiteList: 'whiteList',

    // If temp is in the Blacklist, send an alert
    blackList: 'blackList',

    // If the temp is between the min and max, send an alert
    between: 'between',

    // If the temp is above the max or below the min, send an alert
    outOf: 'outOf'
};

module.exports = {
    Type
};
