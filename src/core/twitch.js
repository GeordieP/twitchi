'use strict'

const auth = require('./auth')
const request = require('request-promise-native')
const Result = require('@geordiep/result')

const ipcServer = require('./ipcServer')
const config = require('./config')
const notifManager = require('./notifManager')

// import API info from separate file
// see the import in auth.js for more info
const { clientID } = require('./twitchApiInfo')

// JSON Request URLs
const getUserURL = 'https://api.twitch.tv/kraken/user'
const createUnfollowStreamURL = (myUserID, unfollowChanID) => (
    `https://api.twitch.tv/kraken/users/${myUserID}/follows/channels/${unfollowChanID}`
)

const createFollowedStreamsUrl = (limit = FOLLOW_LIST_LIMIT, offset = 0) => [
    'https://api.twitch.tv/kraken/streams/followed',
    '?limit=' + limit,
    '&offset='+ offset
].join('')

// follow list item limit;
// the number of streams twitch will give us in each follow list request
// twitch's default is 25
const FOLLOW_LIST_LIMIT = 25

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
    headers: {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-ID': clientID,
        'Authorization': 'OAuth ' + accessToken
    },
    json: true
})

module.exports.updateStoredUserInfo = () => new Promise(async function(resolve, reject) {
    let token = await auth.getTokenExistingOrNew()
    let user = await authedJSONRequest(getUserURL, token)

    try {
        config.set('user-id', user._id)
        config.set('user-name', user.display_name)
    } catch(e) {
        reject(e)
    }
})

module.exports.clearStoredUserInfo = () => {
    config.set('user-id', '')
    config.set('user-name', user.display_name)
}

module.exports.getFollowList = (pageIndex = 0) => new Promise(async function(resolve, reject) {
    ipcServer.ipcSend('event-twitch-follow-list-refresh-begin')

    try {
        let token = await auth.getTokenExistingOrNew()

        // request first page of streams regardless of our page index
        let streamsPageZero = await authedJSONRequest(createFollowedStreamsUrl(), token)
        let allStreams

        // pagination info
        // total number of live channels in follow list
        const totalStreams = streamsPageZero._total
        // number of streams we've fetched so far
        const curNumStreams = streamsPageZero.streams.length
        // number of available pages (including first page, which we've already fetched)
        const totalPages = Math.ceil((totalStreams - curNumStreams) / FOLLOW_LIST_LIMIT)

        // if there are more pages to fetch, do so before resolving streams
        if (pageIndex === 0) {
            // no remaining pages to fetch, just resolve the list we got from the first request
            allStreams = streamsPageZero.streams
        } else {
            // loop from 1 to end; skip the first page, as we already have it stored and don't need to fetch it again.
            // NOTE: doing this (above comment) may cause an issue where a stream shows up twice in the list;
            // (if a stream gets bumped to the next page in-between the first request and a 'load more' request)
            // it's rare enough that we won't care for now (fewer net requests is a bigger win), but if people start
            // encountering this issue enough, we'll do all requests every time or have smarter stream list concatenation after all requests are done.
            let urls = new Array(pageIndex)
            for (let i = 1; i <= pageIndex; i++) {
                // create a request URL where the limit = our limit constant,
                // and offset = index of the first stream on the page
                // (page number * number of streams per page)
                urls[i-1] = createFollowedStreamsUrl(
                    FOLLOW_LIST_LIMIT,
                    i * FOLLOW_LIST_LIMIT
                )
            }

            // send a request to each page URL, wait for all to respond before building the full streams list
            const allPages = await Promise.all(urls.map(url => authedJSONRequest(url, token)))

            // all requests done, reduce the result to turn [{streams: [{},]},] into newStreams: [{},]
            const newStreams = allPages.reduce((accum, curr) => accum.concat(curr.streams), [])

            // create full streams array out of existing first page and all new pages
            allStreams = streamsPageZero.streams.concat(newStreams)
        }

        // update the frontend with the current pagination status
        // the keys here are expected by the app frontend
        ipcServer.ipcSend('twitch-update-follow-list-details-res', Result.newOk({
            followListCurrentPageNum: pageIndex,
            followListNumExtraPages: totalPages - pageIndex
        }))

        // we're done building a stream list, resolve it to caller
        resolve(allStreams)

        // NOTIFICATION HANDLING

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

    ipcServer.ipcSend('event-twitch-follow-list-refresh-finish')
})

const timedRefresh = async () => {
    let result

    try {
        const followList = await module.exports.getFollowList()
        result = Result.newOk(followList)
    } catch(e) {
        result = Result.newError(e, 'ipcServer @ twitch-get-follow-list')
    }

    ipcServer.ipcSend('twitch-get-follow-list-res', result)
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

module.exports.unfollowChannel = unfollowChanID => new Promise(async (resolve, reject) => {
    try {
        const userID = config.get('user-id')

        if (userID == null || userID.length === 0) {
            throw 'Could not unfollow channel: Logged in user ID was missing or empty'
        }

        let token = await auth.getTokenExistingOrNew()
        const url = createUnfollowStreamURL(userID, unfollowChanID)

        await request.delete({
            url,
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': clientID,
                'Authorization': 'OAuth ' + token
            },
            json: true
        })

        resolve()
    } catch(e) {
        reject(e)
    }
})

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
