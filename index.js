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
//	      "type": "ACCESSORY TYPE " ( light|switch|outlet )",
//     	      "lwt": "OPTIONAL: MQTT LAST WILL AND TESTAMENT TOPIC",
//            "lwtPayload": "lwt Payload",
//    	      "topics": {
// 			"statusGet": 	"MQTT TOPIC SWITCH STATUS",
// 			"statusSet": 	"MQTT TOPIC SETTING SWITCH",
//		        "statusUpd":    [OPTIONAL] "MQTT TOPIC STATUS COMMAND ( default <statusSet> )"
//		        "statusCmd":    [OPTIONAL] "STATUS COMMAND PAYLOAD"
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
			topic: '/lwt',
			payload: this.name + ' Connection Closed abnormally..!',
			qos: 0,
			retain: false
		},
		username: config["username"],
		password: config["password"],
    		rejectUnauthorized: false
	};
	this.topicStatusGet	= config["topics"].statusGet;
	this.topicStatusSet	= config["topics"].statusSet;
    	this.statusCmd 		= config["topics"].statusCmd;
	this.topicStatusUpdate	= config["topics"].statusUpd || this.topicStatusSet;
	this.onValue 		= (config["onValue"] !== undefined) ? config["onValue"]: "true";
	this.offValue 		= (config["offValue"] !== undefined) ? config["offValue"]: "false";

	this.switchStatus = false;

        if( this.topicStatusGet != undefined ) {
                this.lwt = config["lwt"];
                this.lwt_payload = config["lwtPayload"];
        };

        if (this.lwt !== undefined ) this.reachable = false
        else this.reachable = true;

	if ("light" == config["type"]) this.service = new Service.Lightbulb(this.name)
	else if ( 'outlet' == config["type"] ) this.service = new Service.Outlet(this.name) 
	else this.service = new Service.Switch(this.name); 

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

        // Fixed issue where after disconnections topics would no resubscripted
        // based on idea by [MrBalonio] (https://github.com/mrbalonio)
        this.client.on('connect', function () {
                that.log('Subscribing to topics');
		if( that.topicStatusGet !== undefined ) that.client.subscribe(that.topicStatusGet);
                if( that.lwt !== undefined ) that.client.subscribe(that.lwt);
        });

	this.client.on('message', function (topic, message) {
		var status = message.toString();
                if( topic == that.lwt ) {
                        if ( status == that.lwt_payload ) {
                                that.log("Gone Offline");
                                that.reachable = false;
                        // Trick to force "Not Responding" state
                                that.service.removeCharacteristic(that.StatusFault);
                        } else {
                        	if(!that.reachable) {
                                	that.log("Back Online");
                                	that.reachable = true;
                        	// Trick to force the clear of the "Not Responding" state
                                	that.service.addOptionalCharacteristic(Characteristic.StatusFault);
                                	that.StatusFault = that.service.getCharacteristic(Characteristic.StatusFault);
                        	};
			}
                } else {
                        if(!that.reachable) {
                                that.reachable = true;
                        // Trick to force the clear of the "Not Responding" state
                                that.service.addOptionalCharacteristic(Characteristic.StatusFault);
                                that.StatusFault = that.service.getCharacteristic(Characteristic.StatusFault);
                        };
			if (topic == that.topicStatusGet) {
                        	if (status == that.onValue || status == that.offValue ) {
			    		that.switchStatus = (status == that.onValue) ? true : false;
		   	    		that.service.getCharacteristic(Characteristic.On).setValue(that.switchStatus, undefined, 'fromSetValue');
                        	}
			}
		}
	});
}

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;

  	homebridge.registerAccessory("homebridge-mqttswitch_type", "mqttswitch_type", MqttSwitch_typeAccessory);
}

MqttSwitch_typeAccessory.prototype = {

	getStatus: function(callback) {
    		if (this.statusCmd !== undefined) {
//    			this.client.publish(this.topicStatusSet, this.statusCmd, this.publish_options);
    			this.client.publish(this.topicStatusUpdate, this.statusCmd, this.publish_options);
    		}
                if( this.reachable) {
	    		callback(null, this.switchStatus);
//                 i	callback();
                } else {
                        this.log("Offline");
                        callback(1);
                }
	},

	setStatus: function(status, callback, context) {
		if( this.reachable) {
			if(context !== 'fromSetValue') {
				this.switchStatus = status;
	    			this.client.publish(this.topicStatusSet, status ? this.onValue : this.offValue, this.publish_options);
			}
			callback();
		} else callback(1);
	},

	getServices: function() {
  		return [this.infoService, this.service];
	},
};
