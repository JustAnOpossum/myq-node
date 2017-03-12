This module is made for people who have a Myq Chamberlain garage door opener.

## This is made for API v 4.1. As of March 2017 it is working correctly.

# Install

`npm i myq-node -save`

# Usage

```javascript
let myq = require('node-chamberlain')

myq.login('email@example.com', 'password', 123456)
//Email and password are reqired, device ID is optional

myq.getDevices().then(devices => {
  console.log(devices) //returns array of devices
}).catch(console.log) //Don't forget to catch errors

/*If you set a device ID then it will use one for the rest of the methods, if not just provide
one now*/

myq.getState().then(state => {
  console.log(state)
}).catch(console.log)

myq.openDoor().then(door => {
  console.log(door) //If this does not work, try other device Ids'
}).catch(console.log)

myq.closeDoor().then(door => {
  console.log(door)
}).catch(console.log)
```

# Methods

## login(email, password[, deviceId])

Promise, sets email address and password for future requests. deviceId is optional but will set them for other methods.

## getDevices()

Promise, gets devices connected to your myq account.

## getState([deviceId])

Promise, returns state of the device.

2 = Closed

8 = Opening or Closing

9 = Open

## openDoor([deviceId])

Promise, opens the selected device. Returns if the device was opened.

## closeDoor([deviceId])

Promise, opens the selected device. Returns if the device was closed.
