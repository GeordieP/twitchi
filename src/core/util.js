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