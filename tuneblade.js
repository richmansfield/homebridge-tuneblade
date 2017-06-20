'use strict';
var Service, Characteristic;
var request = require("request");
var express = require('express');

// Get speaker id from http://192.168.0.2:8000/devices 

module.exports = function(homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    homebridge.registerAccessory("homebridge-tuneblade", "tuneblade", TuneBladePlugin);
}

function TuneBladePlugin(log, config) {
	this.log = log;
	this.name      = config["name"];	
	this.api       = config["api"];
	this.speakerid = config["speakerid"];	
	this.polltime  = Number(config["pollTime"]) * 1000;
	this.connected = false;
	this.volume    = 0;
	
	this.infoService = new Service.AccessoryInformation();
	this.infoService
	 .setCharacteristic(Characteristic.Manufacturer, "Tuneblade")
	 .setCharacteristic(Characteristic.Model, "Speaker")
	 .setCharacteristic(Characteristic.SerialNumber, "000000");

		//NEED iOS11 - this.tunebladeService = new Service.Speaker(this.name);
		// Characteristics for name, volume, mute
		
		// Lightbulb has On & Brightness

//	this.tunebladeService = new Service.Switch(this.name);
	this.tunebladeService = new Service.Lightbulb(this.name);
	this.tunebladeService.getCharacteristic(Characteristic.On)
		.on('set', this.setStatus.bind(this));   
	
	this.tunebladeService.getCharacteristic(Characteristic.Brightness)
      .on('set', this.setBrightness.bind(this));
	
    setInterval(this.queryState.bind(this), this.polltime);
	this.queryState();
}

TuneBladePlugin.prototype.processState = function (newstate) {
	if (newstate == "Connected") {
		if (this.connected == false) {
			this.log("%s now connected", this.name);
			this.connected = true;
			this.tunebladeService.getCharacteristic(Characteristic.On).setValue(true);
		}
	} else if (newstate == "Disconnected") {
		if (this.connected == true) {
			this.log("%s now disconnected", this.name);
			this.connected = false;
			this.tunebladeService.getCharacteristic(Characteristic.On).setValue(false);
		}
	} else {
		this.log("Unknown state: %s", newstate);
	}	
}

TuneBladePlugin.prototype.processVolume = function (volume) {
	if (this.volume != volume) {
		this.volume = volume;
		this.tunebladeService.getCharacteristic(Characteristic.Brightness).setValue(volume);
	}
}
       	
TuneBladePlugin.prototype.queryState = function () {
	request.get({
		url: this.api + "/devices/" + this.speakerid
	}, function(err, response, body) {
		if (!err && response.statusCode == 200) {
			try {
				var json = JSON.parse(body);
				this.processState(json["Status"]);
				this.processVolume(json["Volume"]);
				
			} catch (e) {
        		this.log("Exception parsing response from %s: Content was %s", this.name, body);
   			}
		} else {
			this.log("Error getting state: %s", err);
		}
	}.bind(this));
}

TuneBladePlugin.prototype.setBrightness = function (level, callback) {

	this.log("Setting volume to ", level);
	
	request({ 
		url: this.api + "/devices/" + this.speakerid, 
		method: 'PUT', 
		json: {"Volume": level}}, 
	callback)	  			
}

TuneBladePlugin.prototype.setStatus = function (status, callback) {
		
	this.log("Setting status from %s to %s", (this.connected) ? "Connected" : "Disconnected", (status) ? "Connected" : "Disconnected");
	
	if (status) {	
		request({ 
			url: this.api + "/devices/" + this.speakerid, 
			method: 'PUT', 
			json: {"Status": "Connect"}}, 
		callback)
	} else {
		request({ 
			url: this.api + "/devices/" + this.speakerid, 
			method: 'PUT', 
			json: {"Status": "Disconnect"}}, 
		callback)
	}	
	  			
	this.connected = status;
}

TuneBladePlugin.prototype.identify = function(callback) {
    this.log("Identify requested!");
    callback(); 
}

TuneBladePlugin.prototype.getServices = function () {
	return [this.infoService, this.tunebladeService];
}