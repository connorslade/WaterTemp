# 🤹‍♀️ Multi Sensor Plugin

## 📜 Description

This plugin allows displaying the data of multiple sensors on one page.

It also allows for creating alert rules based on the data of multiple sensors. You can have it notify you when a sensor goes in / out of a certain range. Each alert can be applied to a sensor or to all the sensors. These alerts can be sent by email or Discord webhooks.

The default page is /multi but it can be changed in the config file.

Image ⤵

![](https://i.imgur.com/eUM9YkB.png)

## 💠 Installation

To install this plugin just move the `multiSensor` folder to `api/plugins/` and restart the server. If you see `🍞 Loading multiSensor v0.1` in the console, you're good to go.

To use some features of this plugin you will need to install some extra packages

The system will still work without these packages installed but wont be able to send alerts.

Run this command in the api directory:
```bash
$ npm i nodemailer axios
```

## ⚙ Configuration

All plugin configuration is done in the config.js file.

It has comments to help you understand it.