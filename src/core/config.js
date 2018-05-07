'use strict'

const electronStore = require('electron-store')
const currentVersion = require('./version').version
const { StreamViewerTypes } = require('./util')

// config defaults
// these are used if the expected config file is empty or does not exist
const defaults = {
    'user-access-token': '',
    'preferred-stream-quality': 'best',
    'auto-refresh-follow-list-enabled': true,
    'auto-refresh-follow-list-intvl-minutes': 5,
    'live-notification-enabled': true,
    'favorite-streams': [],
    'streamlink-exe-path': '',
    'stream-viewer': StreamViewerTypes.ELECTRON,
    'open-chat-with-stream': false,
}

const config = new electronStore({
    name: 'twitchi',
    defaults
})

// if config contains no version number or lower version number,
// overwrite the config with our new defaults, and add a version number.
const configVersion = config.get('twitchi-version')
if (configVersion == null || versIsLowerThan(configVersion, currentVersion)) {
    config.clear()
    config.set(defaults)
    config.set({
        'twitchi-version': currentVersion
    })
}

// return true if 'compare' represents a lower version than 'base'.
// compare and base should both be strings in SemVer format.
function versIsLowerThan(compare, base) {
    const REGEX_VERSNUM_SPLIT = /\d+/g
    const [ baseMajor, baseMinor ] = base.match(REGEX_VERSNUM_SPLIT).map(n => parseInt(n))
    const [ cmpMajor, cmpMinor ] = compare.match(REGEX_VERSNUM_SPLIT).map(n => parseInt(n))

    // major vers num
    // major version is smaller, compare vers is lower
    if (cmpMajor < baseMajor) return true
    // major version is larger, compare vers is not lower
    if (cmpMajor > baseMajor) return false
    // if we pass this, major version is the same; check minor vers num

    // minor version is smaller, compare vers is lower
    if (cmpMinor < baseMinor) return true

    // major and minors are both the same or higher
    return false
}

module.exports = config
