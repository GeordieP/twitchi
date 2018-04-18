'use strict'

const auth = require('./auth')
const request = require('request-promise-native')
const Result = require('@geordiep/result')

const ipcServer = require('./ipcServer')
const config = require('./config')
const notifManager = require('./notifManager')

// JSON Request URLs
const followedStreamsURI = 'https://api.twitch.tv/kraken/streams/followed'
const requestTokenArg = '?oauth_token='

// auto-refresh interval
let REFRESH_INTERVAL_TIME_MINUTES = 5 // 5 minutes by default
let refreshIntervalObj

// hold list of names that were live during last check
let LIVE_CHANNEL_NAMES_CACHE = []

// keep track of whether or not this is the first refresh.
// if it is, we don't show a 'live streams' toast notification.
let isFirstRefresh = true

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
        let streams = await authedJSONRequest(followedStreamsURI, token)
        ipcServer.ipcSendJson('event-twitch-follow-list-refresh-finish')
        resolve(streams)

        // on first refresh, don't send a notification, and update isFirstRefresh value
        if (isFirstRefresh) {
            isFirstRefresh = false
        } else {
            // if no streams are live, clear cache and ignore rest of logic below
            if (streams['_total'].length === 0) {
                LIVE_CHANNEL_NAMES_CACHE = []
                return
            }

            let newStreams
            if (LIVE_CHANNEL_NAMES_CACHE.length === 0) {
                // don't do diff if there are no names in the cache
                newStreams = streams.streams
            } else {
                // diff new streams and old streams
                // filter full streams list down to just the names that aren't in the cache from the previous refresh
                newStreams = streams.streams.filter(s => !LIVE_CHANNEL_NAMES_CACHE.includes(s.channel.name))
            }

            notifManager.showLiveStreamsNotif(newStreams)
        }

        // update the live names cache
        LIVE_CHANNEL_NAMES_CACHE = streams.streams.map(s => s.channel.name)
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
