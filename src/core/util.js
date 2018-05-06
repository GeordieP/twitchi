const request = require('request-promise-native')
const { clientID } = require('./twitchApiInfo')

// call request() with twitch auth token in options.
// Returns a promise. Resolves with response data, rejects with error.
module.exports.authedJSONRequest = (uri, token) => request({
    uri,
    headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-ID': clientID,
        'Authorization': 'OAuth ' + token
    },
    json: true
})

module.exports.InstanceStates = Object.freeze({
    IDLE: 0,
    OPEN: 1,
    DELETEQUEUED: 2
})

module.exports.StreamViewerTypes = Object.freeze({
    STREAMLINK: 0,
    ELECTRON: 1
})
