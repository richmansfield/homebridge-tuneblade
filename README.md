# homebridge-tuneblade

## Intro

This plugin enables enabling, disabling and volume control of AirPlay speakers as part of a multi-room setup powered by [TuneBlade](http://www.tuneblade.com/).

Since iOS 10 does not support speakers, they are emulating lightbulbs in the Home app with brightness level representing volume. 

Once iOS 11 with speaker support is released, I will swap this over.

## Setup

1. Ensure TuneBlade remote port is set to a fixed port. Go to TuneBlade settings, 'Remote Control' then select manual port and enter a free port
2. Visit http://<yourtunebladeserver>:<port>/devices in a web browser, this will list configured device ID's that you will need for the configuration 
3. Install this plugin into your homebridge setup
4. Update your config file to include your speakers (see examples below)

## Config 
Add each speaker you want to control to your config.json file, e.g.:
```
{
"accessory": "tuneblade",
"name": "My Speaker",
"pollTime": "60",
"api": "http://192.168.0.2:8000",
"speakerid": "yourspeakerid"
}
```    
**name** is shown in the Home app, and each speaker block you add needs to have a unique name

**pollTime** queries the API every x seconds to update homekit in case you controlled the speaker via the iOS app or Windows app. 

**api** is your tuneblade internal network server ip and the remote control port configured in step 1

**speakerid** is obtained from step 2 above
