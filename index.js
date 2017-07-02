// MQTT Switch Accessory plugin for HomeBridge
//
// Remember to add accessory to config.json. Example:
// "accessories": [
//     {
//            "accessory": "mqttswitch_type",
//            "name": "SWITCH NAME",
//            "url": "URL OF THE BROKER",
//	      "username": "USERNAME OF THE BROKER",
//            "password": "PASSWORD OF THE BROKER",
// 	      "caption": "SWITCH LABEL",
//	      "type": "ACCESSORY TYPE " ( light|switch )",
//    	      "topics": {
// 			"statusGet": 	"MQTT TOPIC FOR THE GETTING THE STATUS OF SWITCH",
// 			"statusSet": 	"MQTT TOPIC FOR THE SETTING THE STATUS OF SWITCH",
//		        "statusCmd":    "OPTIONALLY THE STATUS COMMAND"
// 		  },
//	      "onValue": "OPTIONALLY THE VALUE THAT MEANS ON (DEFAULT true)",
//	      "offValue": "OPTIONALLY THE VALUE THAT MEANS ON (DEFAULT false)"
//     }
// ],
//
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.

'use strict';

var Service, Characteristic;
var mqtt = require("mqtt");

function MqttSwitch_typeAccessory(log, config) {
  	this.log        = log;
  	this.name 	= config["name"];
  	this.url	= config["url"];
    	this.publish_options = {
      		qos: ((config["qos"] !== undefined)? config["qos"]: 0)
    	};
	this.client_Id 	= 'mqttjs_' + Math.random().toString(16).substr(2, 8);
	this.options = {
        	keepalive: 10,
    		clientId: this.client_Id,
        	protocolId: 'MQTT',
    		protocolVersion: 4,
    		clean: true,
    		reconnectPeriod: 1000,
    		connectTimeout: 30 * 1000,
		will: {
			topic: 'WillMsg',
			payload: 'Connection Closed abnormally..!',
			qos: 0,
			retain: false
		},
		username: config["username"],
		password: config["password"],
    		rejectUnauthorized: false
	};
	this.caption		= config["caption"];
	this.topicStatusGet	= config["topics"].statusGet;
	this.topicStatusSet	= config["topics"].statusSet;
    	this.statusCmd 		= config["topics"].statusCmd;
	this.onValue 		= (config["onValue"] !== undefined) ? config["onValue"]: "true";
	this.offValue 		= (config["offValue"] !== undefined) ? config["offValue"]: "false";

	this.switchStatus = false;

	if ("light" == config["type"]) {	
		this.service = new Service.Lightbulb(this.name);
	} else { 
		this.service = new Service.Switch(this.name); 
	};

  	this.service
    		.getCharacteristic(Characteristic.On)
    		.on('get', this.getStatus.bind(this))
    		.on('set', this.setStatus.bind(this));

        this.infoService = new Service.AccessoryInformation();
        this.infoService
           .setCharacteristic(Characteristic.Manufacturer, "Opensource Community")
           .setCharacteristic(Characteristic.Model, "MQTT Switch [ Light|Switch selectable version]")
           .setCharacteristic(Characteristic.SerialNumber, "Version 1.0.0");

	// connect to MQTT broker
	this.client = mqtt.connect(this.url, this.options);
	var that = this;
	this.client.on('error', function () {
		that.log('Error event on MQTT');
	});

	this.client.on('message', function (topic, message) {
		if (topic == that.topicStatusGet) {
			var status = message.toString();
                        if (status == that.onValue || status == that.offValue ) {
			    that.switchStatus = (status == that.onValue) ? true : false;
		   	    that.service.getCharacteristic(Characteristic.On).setValue(that.switchStatus, undefined, 'fromSetValue');
                        }
		}
	});
    	
	this.client.subscribe(this.topicStatusGet);
}

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;

  	homebridge.registerAccessory("homebridge-mqttswitch_type", "mqttswitch_type", MqttSwitch_typeAccessory);
}

MqttSwitch_typeAccessory.prototype = {

	getStatus: function(callback) {
    		if (this.statusCmd !== undefined) {
    			this.client.publish(this.topicStatusSet, this.statusCmd, this.publish_options);
    		}
	    	callback(null, this.switchStatus);
	},

	setStatus: function(status, callback, context) {
		if(context !== 'fromSetValue') {
			this.switchStatus = status;
	    		this.client.publish(this.topicStatusSet, status ? this.onValue : this.offValue, this.publish_options);
		}
		callback();
	},

	getServices: function() {
  		return [this.infoService, this.service];
	},
};
