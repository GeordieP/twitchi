'use strict'

const ipc = require('electron').ipcMain
const twitch = require('./twitch')
const auth = require('./auth')
const config = require ('./config')
const streamManager = require('./streamManager')
const currentVersion = require('./version').version || '0.0.0'

const Result = require('@geordiep/result')

let MAIN_WINDOW

// app state; whether or not the frontend app is listening for log messages
let state_listeningForLogs = false

function ipcReplyJson(type, msg) { MAIN_WINDOW.webContents.send(type, JSON.stringify(msg)) }

function listen() {
    if (!MAIN_WINDOW) {
        console.error('Error in ipcServer.listen - MAIN_WINDOW not set')
        return
    }

    /* AUTH */
    ipc.on('auth-get-token', async function(evt) {
        let result

        try {
            const token = await auth.getTokenExistingOrNew()
            result = Result.newOk(token)
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ auth-get-token')
        }
        
        ipcReplyJson('auth-get-token-res', result)
    })

    ipc.on('auth-refresh-token', async function(evt) {
        let result

        try {
            const token = await auth.refreshToken()
            result = Result.newOk()
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ auth-refresh-token')
        }
        
        ipcReplyJson('auth-refresh-token-res', result)
    })

    ipc.on('auth-revoke-token', async function(evt) {
        let result

        try {
            const token = await auth.revokeToken()
            result = Result.newOk()
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ auth-revoke-token')
        }
        
        ipcReplyJson('auth-revoke-token-res', result)
    })

    /* TWITCH */
    ipc.on('twitch-get-follow-list', async function(evt) {
        let result

        try {
            const followList = await twitch.getFollowList()
            result = Result.newOk(followList)
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ twitch-get-follow-list')
        }

        ipcReplyJson('twitch-get-follow-list-res', result)
    })

    /* STREAMLINK */
    ipc.on('streamlink-open-url', async function(evt, { channelName, channelURL, quality }) {
        let result
        
        try {
            if (channelName == null || channelName.length === 0) {
                throw 'Could not open stream: Channel name was missing or empty.'
            }

            if (channelURL == null || channelURL.length === 0) {
                throw 'Could not open stream: Channel URL was missing or empty.'
            }
            
            // create stream instance
            await streamManager.createStream(channelName, channelURL)
            // attempt to open instance with desired quality
            await streamManager.openStream(channelName, quality)
            result = Result.newOk(channelName)
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ streamlink-open-url')
        }

        ipcReplyJson('streamlink-open-url-res', result)
    })

    ipc.on('streamlink-close-stream', async function(evt, channelName) {
        let result

        try {
            await streamManager.closeStream(channelName)
            result = Result.newOk(channelName)
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ streamlink-close-stream')
        }

        ipcReplyJson('streamlink-close-stream-res', result)
    })

    ipc.on('streamlink-get-all-logs', async function(evt) {
        let result

        try {
            const logs = await streamManager.getAllLogs()
            result = Result.newOk(logs)
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ streamlink-get-all-logs')
        }

        ipcReplyJson('streamlink-get-all-logs-res', result)
    })

    ipc.on('streamlink-get-open-streams', async function(evt) {
        let result

        try {
            const openStreams = await streamManager.getOpenStreams()
            result = Result.newOk(openStreams)
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ streamlink-get-open-streams')
        }

        ipcReplyJson('streamlink-get-open-streams-res', result)
    })

    /* PREFERENCES */
    ipc.on('prefs-get-all', function(evt) {
        let result
        const prefs = config.store

        // check for null or undefined
        if (prefs == null) {
            result = Result.newError(
                'Could not get preferences from configuration file',
                'ipcServer @ prefs-get-all')
        } else {
            result = Result.newOk(prefs)
        }

        ipcReplyJson('prefs-get-all-res', result)
    })

    ipc.on('prefs-get-one', function(evt, key) {
        let result

        try {
            const pref = config.get(key)

            // check for null or undefined
            if (pref == null) {
                throw 'Could not get property '+key+' from preferences'
            }

            result = Result.newOk(pref)
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ prefs-get-one')
        }

        ipcReplyJson('prefs-get-one-res', result)
    })

    ipc.on('prefs-set-one', function (evt, { key, value }) {
        let result

        try {
            if (key == null) {
                throw 'Could not set preferences property: No key was provided (got '+key+')'
            }
            config.set(key, value)
            result = Result.newOk()
        } catch(e) {
            result = Result.newError(e, 'ipcServer @ prefs-set-one')
        }

        ipcReplyJson('prefs-set-one-res', result)
    })

    // TODO:
    // prefs-delete-one

    ipc.on('app-get-version', function (evt) {
        let result = Result.newOk(currentVersion)
        ipcReplyJson('app-get-version-res', result)
    })

    ipc.on('app-subscribe-logs', function(evt) {
        state_listeningForLogs = true
        // for now, no need to reply
        // ipcreplyjson('app-subscribe-logs-res', result.newOk())
    })

    ipc.on('app-unsubscribe-logs', function(evt) {
        state_listeningForLogs = false
        // for now, no need to reply
        // ipcreplyjson('app-unsubscribe-logs-res', result.newOk())
    })
}

module.exports.getMainWindow = function() {
    return MAIN_WINDOW
}

module.exports.start = function(mainWindow) {
    MAIN_WINDOW = mainWindow
    listen()
}

// access to log listening status from other modules
module.exports.listeningForLogs = () => state_listeningForLogs
