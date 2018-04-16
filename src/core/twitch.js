'use strict'

const auth = require('./auth')
const request = require('request-promise-native')
const Result = require('@geordiep/result')

const ipcServer = require('./ipcServer')
const config = require('./config')

// JSON Request URLs
const followedStreamsURI = 'https://api.twitch.tv/kraken/streams/followed'
const requestTokenArg = '?oauth_token='

// auto-refresh interval
let REFRESH_INTERVAL_TIME_MINUTES = 5 // 5 minutes by default
let refreshIntervalObj

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

const timedRefresh = async () => {
    let result

    try {
        const followList = await module.exports.getFollowList()
        result = Result.newOk(followList)
    } catch(e) {
        result = Result.newError(e, 'ipcServer @ twitch-get-follow-list')
    }

    ipcServer.ipcSendJson('twitch-get-follow-list-res', result)
}

module.exports.enableAutoRefresh = () => {
    REFRESH_INTERVAL_TIME_MINUTES = config.get('auto-refresh-follow-list-intvl-minutes') || 5

    // NOTE: must convert minutes value into milliseconds here! (MINUTES*1000*60)
    refreshIntervalObj = setInterval(
        timedRefresh,
        REFRESH_INTERVAL_TIME_MINUTES * 1000 * 60
    )
}

module.exports.disableAutoRefresh = () => {
    clearInterval(refreshIntervalObj)
    refreshIntervalObj = null
}

// restart interval timer if it's already active.
// if it's not active, we dont need to do anything.
// this function allows us to stop an existing timer and
// start a new one with an updated interval duration from config file
// (handled by enableAutoRefresh)
module.exports.restartInterval = () => {
    if (config.get('auto-refresh-follow-list-enabled') === true) {
        module.exports.disableAutoRefresh()
        module.exports.enableAutoRefresh()
    }
}

// SETUP: enable auto refresh
// begin auto refresh interval if preferences auto refresh setting is enabled
//
// the auto-refresh callback (timedRefresh) depends on ipcServer and its mainWindow variable
// to be instantiated; it's not guaranteed that they will be with an immediate call,
// but since this is a timed event (and the minimum length should be constant), there
// shouldn't be any issues; the function should get called a few minutes after the rest
// of the app is set up, at the very least.
if (config.get('auto-refresh-follow-list-enabled') === true) {
    module.exports.enableAutoRefresh()
}
