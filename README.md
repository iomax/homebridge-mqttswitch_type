# homebridge-mqttswitch_type
An homebridge plugin that create an HomeKit Switch, or Light,  accessory mapped on MQTT topics. 

# Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.
The plugin must be cloned locally (git clone https://github.com/iomax/homebridge-mqttswitch_type.git ) and should be installed "globally" by typing:

    npm install -g ./homebridge-mqttswitch_type
    
# Release notes
Version 1.0.2
+ Initial draft

# Configuration
Remember to configure the plugin in config.json in your home directory inside the .homebridge directory. Configuration parameters:
```javascript
{
   "accessory": "mqttswitch_type",
   "name": "SWITCH NAME",
   "url": "URL OF THE BROKER",
   "username": "USERNAME OF THE BROKER",
   "password": "PASSWORD OF THE BROKER",
   "caption": "SWITCH LABEL",
   "type": "ACCESSORY TYPE ( light|switch )",
   "lwt": "OPTIONAL: LAST WILL AND TESTAMENT TOPIC",
   "lwtPayload": "lwt Payload",
   "topics": {
		"statusGet":    "MQTT TOPIC SWITCH STATUS",
		"statusSet":    "MQTT TOPIC SWITCH SETTING",
		"statusUpd":    [OPTIONAL] "MQTT TOPIC STATUS COMMAND (default <statusSet>)",
		"statusCmd":    [OPTIONAL]  "STATUS COMMAND PAYLOAD"
   },
   "onValue": "OPTIONALLY THE VALUE THAT MEANS ON (DEFAULT true)",
   "offValue": "OPTIONALLY THE VALUE THAT MEANS ON (DEFAULT false)"
}
```

Look for a sample config in [config.json example](https://github.com/iomax/homebridge-mqttswitch_type/blob/master/config-sample.json)

# Credit

The original homebridge MQTT SWITCH plugins work was done by [ilcato](https://github.com/ilcato) in [homebridge-mqttswitch](https://github.com/ilcato/homebridge-mqttswitch) project.

