# homebridge-mqttswitch_type
An homebridge plugin that create an HomeKit Switch, or Light,  accessory mapped on MQTT topics. 

# Installation
Follow the instruction in [homebridge](https://www.npmjs.com/package/homebridge) for the homebridge server installation.
The plugin must be cloned locally (git clone https://github.com/iomax/homebridge-mqttswitch_type.git ) and should be installed "globally" by typing:

    npm install -g ./homebridge-mqttswitch_type
    
# Release notes
Version 1.0.0
+ Initial draft

# Configuration
Remember to configure the plugin in config.json in your home directory inside the .homebridge directory. Configuration parameters:
```javascript
{
  "accessory": "mqttswitch",
  "name": "PUT THE NAME OF YOUR SWITCH HERE",
  "url": "PUT URL OF THE BROKER HERE",
  "username": "PUT USERNAME OF THE BROKER HERE",
  "password": "PUT PASSWORD OF THE BROKER HERE",
  "caption": "PUT THE LABEL OF YOUR SWITCH HERE",
  "type": "PUT ACCESSORY TYPE HERE" ( light|switch ),
  "topics": {
 	"statusGet": 	"PUT THE MQTT TOPIC FOR THE GETTING THE STATUS OF YOUR SWITCH HERE",
 	"statusSet": 	"PUT THE MQTT TOPIC FOR THE SETTING THE STATUS OF YOUR SWITCH HERE"
	},
  "onValue": "OPTIONALLY PUT THE VALUE THAT MEANS ON HERE (DEFAULT true)",
  "offValue": "OPTIONALLY PUT THE VALUE THAT MEANS OFF HERE (DEFAULT false)",
  "statusCmd": "OPTIONALLY PUT THE STATUS COMMAND HERE",
  "integerValue": "OPTIONALLY SET THIS TRUE TO USE 1/0 AS VALUES"
}
```

Look for a sample config in [config.json example](https://github.com/iomax/homebridge-mqttswitch_type/blob/master/config-sample.json)

# Credit

The original homebridge MQTT SWITCH plugins work was done by [ilcato](https://github.com/ilcato) in [homebridge-mqttswitch](https://github.com/ilcato/homebridge-mqttswitch) project.

