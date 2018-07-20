const request = require('request')
const base = 'https://myqexternal.myqdevice.com/api/v4/'

let states = {
  2: 'Closed',
  8: 'Opening/Closing',
  9: 'Open'
}

let config = new Object()
const login = function(user, password, deviceId) {
  if (!user) {
    throw new Error('Enter an email address')
  }
  if (!password) {
    throw new Error('Enter a password')
  }
  config.user = user
  config.password = password
  if (deviceId) {
    config.deviceId = deviceId
  }
}

function headers(token) {
    let base = {
        Culture: 'en',
        BrandId: 2,
        MyQApplicationId: 'OA9I/hgmPHFp9RYKJqCKfwnhh28uqLJzZ9KOJf1DXoo8N2XAaVX6A1wcLYyWsnnv',
        ApiVersion: 4.1
    }
    if (token) {
        return Object.assign(base, token)
    } else {
        return base
    }
}

function makeRequest(options, type, url) {
    return new Promise((res, rej) => {
        request[type](options, (err, req, body) => {
            if (!err && req.statusCode === 200) {
                res(body)
            } else {
              if (req.statusCode != 200) {
                rej(JSON.stringify({resCode:req.statusCode, body: body}))
              }
              else {
                rej(err)
              }
            }
        })
    })
}

function getToken() {
    return new Promise((res, rej) => {
        makeRequest({
            url: `${base}User/Validate`,
            headers: headers(),
            gzip: true,
            body: {
                'password': config.password,
                'username': config.user
            },
            json: true
        }, 'post').then(code => {
            if (code.SecurityToken === undefined) {
                rej(code.ErrorMessage)
            } else {
                res(code.SecurityToken)
            }
        }).catch(rej)
    })
}

const getDevices = function() {
    return new Promise((res, rej) => {
        getToken().then(token => {
            makeRequest({
                url: `${base}UserDeviceDetails/Get?filterOn=true`,
                headers: headers({
                    SecurityToken: token
                }),
                gzip: true
            }, 'get').then(devices => {
              try {
                let parsed = JSON.parse(devices)
                if (parsed.ErrorMessage) {
                  rej(parsed.ErrorMessage)
                }
                else {
                  res(parsed)
                }
              }
              catch(e) {
                rej(e)
              }
            }).catch(rej)
        }).catch(rej)
    })
}

const getState = function(deviceId) {
  return new Promise((res, rej) => {
    deviceId = deviceId || config.deviceId
    getToken().then(token => {
        makeRequest({
            url: `${base}DeviceAttribute/GetDeviceAttribute?myQDeviceId=${deviceId}&attributeName=doorstate`,
            headers: headers({
                SecurityToken: token
            }),
            gzip: true
        }, 'get').then(state => {
          try {
            var parsed = JSON.parse(state)
            if (parsed.ErrorMessage != 0 || !parsed.ErrorMessage) {
              res({code:parsed.AttributeValue, state:states[parsed.AttributeValue], UpdatedTime: parsed.UpdatedTime})
            }
            else {
              rej(parsed.ErrorMessage)
            }
          }
          catch(e) {
            rej(e)
          }
        }).catch(rej)
    }).catch(rej)
  })
}

function stateChange(change, deviceId) {
  return new Promise((res, rej) => {
    let types = {
      close: 0,
      open: 1
    }
    getToken().then(token => {
      makeRequest({
          url: `${base}DeviceAttribute/PutDeviceAttribute`,
          headers: headers({
              SecurityToken: token
          }),
          body: {
            'attributeName':'desireddoorstate',
            'AttributeValue':types[change],
            'myQDeviceId':deviceId
          },
          json: true,
          gzip: true
      }, 'put').then(res).catch(rej)
    }).catch(rej)
  })
}

const openDoor = function(deviceId) {
  return new Promise((res, rej) => {
    deviceId = deviceId || config.deviceId
        stateChange('open', deviceId).then(state => {
          try {
            if (state.ErrorMessage) {
              rej(state.ErrorMessage)
            }
            else {
              res({doorOpened: true, UpdatedTime: state.UpdatedTime})
            }
          }
          catch(e) {
            rej(e)
          }
        }).catch(rej)
  })
}

const closeDoor = function(deviceId) {
  return new Promise((res, rej) => {
    deviceId = deviceId || config.deviceId
        stateChange('close', deviceId).then(state => {
          try {
            if (state.ErrorMessage) {
              rej(parsed.ErrorMessage)
            }
            else {
              res({doorClosed: true, UpdatedTime: state.UpdatedTime})
            }
          }
          catch(e) {
            rej(e)
          }
        }).catch(rej)
  })
}

exports.login = login
exports.getDevices = getDevices
exports.getState = getState
exports.openDoor = openDoor
exports.closeDoor = closeDoor
