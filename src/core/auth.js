'use strict'

const { BrowserWindow } = require('electron')
const request = require('request-promise-native')
const Result = require('@geordiep/result')

const config = require('./config')
const ipcServer = require('./ipcServer')

// import API info from separate file
// this module simply exports an object containing the following keys:
//// clientID: "client id here",
//// redirectURI: "oauth redirect URI here"
// the file is not tracked in the git repository; you'll have to create your own, using your own client ID and redirect URI.
// The information can be found in your twitch developer dashboard.
let clientID, redirectURI
try {
    const data = require('./twitchApiInfo')
    clientID = data.clientID
    redirectURI = data.redirectURI 
} catch(e) {
    throw new Error('Could not load API info module. Please check that src/core/twitchApiInfo.js exists, and if not, consult src/core/auth.js for instructions on creating it.')
}

// match and capture access token from redirected URL string
const REGEX_ACCESS_TOKEN = /#access_token=([^&]+)/
// match and capture error information from redirected URL string
const REGEX_ERROR = /error=([^&]+)(?:.error_description=([^&]+))*/
// match string word separator characters
const REGEX_ARG_SEPARATOR = /\+/g

const authURL = [
    'https://id.twitch.tv/oauth2/authorize',
    '?client_id=' + clientID,
    '&redirect_uri=' + redirectURI,
    '&response_type=token',
    '&scope=user_read user_follows_edit'
].join('')

const getRevokeURI = token => ([
    'https://id.twitch.tv/oauth2/revoke',
    '?client_id=' + clientID,
    '&token=' + token
].join(''))

const spawnLoginWindow = (onRedirect, onClosed, onCrashed) => new Promise((resolve, reject) => {
    try {
        const authWindow = new BrowserWindow({
            title: 'Login',
            width: 420, height: 600,
            autoHideMenuBar: false,
            nodeIntegration: false
        })

        // clear cookies and cache so user doesn't get logged in automatically before
        // being given a chance to enter new credentials
        authWindow.webContents.session.clearStorageData()
        authWindow.setMenu(null)
        authWindow.loadURL(authURL)

        // events
        authWindow.webContents.on('did-get-redirect-request', onRedirect)
        authWindow.webContents.on('closed', onClosed)
        authWindow.webContents.on('crashed', onCrashed)

        resolve(authWindow)
    } catch(e) {
        reject(e)
    }
})

// save token to configuration file
module.exports.saveToken = token => new Promise((resolve, reject) => {
    try {
        if (token == null || token.length === 0) {
            throw 'Received auth token was empty or null.'
        }

        config.set('user-access-token', token)

        ipcServer.ipcSend('auth-refresh-token-res', Result.newOk())

        // include saved token in response
        resolve(token)
    } catch(e) {
        e.message = 'Could not save access token to file. ' + e.message
        reject(e)
    }
})

// get token from configuration file, and if none exist,
// open login window to get new token - return new token if successful.
module.exports.getTokenExistingOrNew = () => new Promise((resolve, reject) => {
    let res
    try {
        res = config.get('user-access-token')
    } catch(e) {
        e.message = 'Error reading config file. ' + e.message
        reject(e)
        return
    }

    // check token was found in in file, resolve it if so
    if (res) {
        resolve(res)
        return
    }

    // if not have the user log in so we can get a new one.
    // check for falsy value to handle both undefined and empty string.
    module.exports.newToken()
        .then(resolve)
        .catch(reject)
})

// request a new access token from twitch
module.exports.newToken = () => new Promise(async (resolve, reject) => {
    let authWindow

    try {
        authWindow = await spawnLoginWindow(
            onRedirect,
            onClosed,
            onCrashed
        )
    } catch(e) {
        reject(e)
        return
    }

    function onRedirect(e, oldUrl, url) {
        let match = url.match(REGEX_ACCESS_TOKEN)

        if (match && match[1]) {
            // success, new token held in first match
            authWindow.close()
            // save the new token to configuration, resolve it
            return module.exports.saveToken(match[1])
                .then(resolve)
                .catch(reject)
        }

        // success match failed, try matching an error in redirect URL.
        match = url.match(REGEX_ERROR)
        // result of match will be:
        // match[1] matches error string after 'error=' parameter. eg:
        // match = '&error=unsupported_response_type', match[1] = unsupported_response_type
        //
        // match[2] matches a string after error_description parameter, if it exists.
        // Captured string words are usually separated by + characters.

        // if we get something back in the error match
        if (match && match[1]) {
            // matched an error in redirect URL
            authWindow.close()
            // parse error msg out and respond to caller
            let errStr = 'Error in redirect:\n' + match[1]
            if (match[2]) {
                errStr += '\n' + match[2].replace(REGEX_ARG_SEPARATOR, ' ')
            }

            const err = new Error(errStr)
            console.error(err)
            reject(err)
            return
        }
    }

    function onClosed() {
        reject(new Error('Twitch login window closed'))
    }

    function onCrashed(e, killed) {
        reject(new Error('Twitch login window ' + (killed ? 'was killed' : 'crashed')))
    }
})

// TODO: token refreshing should be done automatically if we detect the token has expired

module.exports.refreshToken = () => new Promise((resolve, reject) => {
    try {
        // forget currently saved token
        config.set('user-access-token', '')
    } catch(e) {
        reject(e)
        return
    }

    // get new token
    module.exports.getTokenExistingOrNew()
        .then(resolve)
        .catch(reject)
})

module.exports.revokeToken = () => new Promise(async (resolve, reject) => {
    try {
        const token = config.get('user-access-token')

        if (token == null || token.length === 0) {
            throw new Error('Could not revoke token; config file token property was missing or empty.')
        }

        const revokeURI = getRevokeURI(token)
        const data = await request({
            method: 'POST',
            uri: revokeURI
        })

        // forget currently saved token
        config.set('user-access-token', '')
        resolve()
    } catch(e) {
        reject(e)
        return
    }
})
