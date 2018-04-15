'use strict'

const auth = require('./auth')
const request = require('request-promise-native')

const ipcServer = require('./ipcServer')

// JSON Request URLs
const followedStreamsURI = 'https://api.twitch.tv/kraken/streams/followed'
const requestTokenArg = '?oauth_token='

// call request() with twitch auth token in options.
// Returns a promise. Resolves with response data, rejects with error.
const authedJSONRequest = (uri, accessToken) => request({
    uri,
    json: true,
    qs: { oauth_token: accessToken },
})

module.exports.getFollowList = () => new Promise(async function(resolve, reject) {
    try {
        ipcServer.ipcSendJson('event-twitch-follow-list-refresh-begin')
        let token = await auth.getTokenExistingOrNew()
        let data = await authedJSONRequest(followedStreamsURI, token)
        ipcServer.ipcSendJson('event-twitch-follow-list-refresh-finish')
        resolve(data)
    } catch(e) {
        reject(e)
    }
})
