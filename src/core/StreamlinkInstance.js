'use strict'

const Result = require('@geordiep/result')

const auth = require('./auth')
const config = require('./config')
const streamManager = require('./streamManager')
const ipcServer = require('./ipcServer')
const { launchStreamlink } = require('./streamlinkProcess')
const { InstanceStates } = require('./util')

// reference to main window - currently gets set during StreamlinkInstance construction
// match 'error: No playable streams found on this URL: twitch.tv/INVALID_USERNAME_HERE'
const REGEX_NO_STREAM_FOUND = /No playable/g
// match 'error: Unable to find channel: [INVALID_USERNAME_HERE]
const REGEX_NO_CHANNEL = /Unable to find channel/g
// match 'error: The specified stream(s) 'QUALITY_OPTION' could not be found.'
const REGEX_STREAM_INVALID_QUALITY = /error: The specified stream\(s\)/g
// match available stream qualities line, capture list of qualities in second group
const REGEX_AVAILABLE_QUALITIES = /(Available streams: )(.+)/g
// match '[cli][info] Stream ended'
const REGEX_STREAM_ENDED = /Stream ended/g
// match ['1080', '60'] from '1080p60', for use in parsing real numbers
// for resolution and fps from quality string
const REGEX_NUMBERS_FROM_QUALITY_STR = /\d+p\d*/g

// max number of log lines for a process to keep
const MAX_LOG_LINES = 50

function StreamlinkInstance(name, url) {
    this.state = InstanceStates.IDLE
    this.channelName = name
    this.channelURL = url
    this.logLines = []
}

StreamlinkInstance.prototype.logLine = function(line) {
    this.logLines.push(line)

    // over lines limit, trunc first line
    if (this.logLines.length > MAX_LOG_LINES) {
        this.logLines.shift()
    }
    
    // send IPC message to frontend that we've got a new stdout message for this channel.
    // send an object containing the username and the new line itself
    if (ipcServer.listeningForLogs()) {
        ipcServer.ipcSend('streamlink-process-stdout-line', {
            username: this.channelName,
            line
        })
    }
}

StreamlinkInstance.prototype.open = function(quality) {
    return new Promise(async (resolve, reject) => {
        // ignore request if stream is already open
        // TODO for now we resolve; we don't tell the
        // frontend that the stream is already open
        if (this.state === InstanceStates.OPEN) {
            resolve()
            return
        }

        try {
            // if we're queued for deletion, cancel the deletion
            if (this.state === InstanceStates.DELETEQUEUED) {
                await streamManager.cancelDeleteAfter(this.channelName)
            }

            // attempt to launch stream with preferred quality.
            // if no quality is passed, use what's in config.
            // calls to StreamlinkInstance.open from the onProcMsg invalid quality handler
            // should always pass a quality and it should be preferred.
            this.quality = quality || config.get('options')['preferredStreamQuality']

            // ask auth module for twitch auth token
            let token = await auth.getTokenExistingOrNew()

            // spawn streamlink process using expected args
            this.process = await launchStreamlink([
                this.channelURL,
                this.quality,
                '--twitch-oauth-token=' + token
            ])

            // update state now that the process has been started
            this.state = InstanceStates.OPEN

            // bind to process events
            // NOTE: we ignore stderr for now, streamlink doesn't seem to print anything to it
            this.process.stdout.on('data', onProcMsg.bind(this))
            this.process.on('exit', () => {
                streamManager.closeStream(this.channelName)    
                    .catch(console.error)
            })

            resolve()
        } catch(e) {
            reject(e)
        }
    })
}

StreamlinkInstance.prototype.close = function() {
    return new Promise((resolve, reject) => {
        // if we're in any state but open, resolve;
        // we don't need to do any extra work.
        // open is the only 'closable' state.
        if (this.state !== InstanceStates.OPEN){
            resolve()
            return
        }

        try {
            this.process.kill()
            this.process = null
            this.state = InstanceStates.IDLE
        } catch(e) {
            reject(e)
            return
        }

        resolve()
    })
}

StreamlinkInstance.prototype.getLogs = function() {
    return this.logLines
}

StreamlinkInstance.prototype.getState = function() {
    return this.state
}

StreamlinkInstance.prototype.setStateIdle = function() {
    this.state = InstanceStates.IDLE
}

StreamlinkInstance.prototype.setStateDeleteQueued = function() {
    this.state = InstanceStates.DELETEQUEUED
}

module.exports = StreamlinkInstance

/*-----------------------
* PROCESS STDOUT HANDLER
* To be bound to a spawned process' data event.
* Handles storing stdout message lines, sending lines to IPC listeners,
* and the following streamlink events (in the form of stdout messages):
* "no stream found", "stream ended" -> Close stream instance.
* "invalid quality" -> Choose the next closest quality to the user's preference.
-----------------------*/

async function onProcMsg(msg) {
    msg = msg.toString()

    // log the stdout line
    this.logLine(msg)

    /* 
     * STREAMLINK EVENTS
     */

    // Handle Streamlink Events: No stream found, stream ended

    REGEX_NO_STREAM_FOUND.lastIndex = 0
    REGEX_NO_CHANNEL.lastIndex = 0
    REGEX_STREAM_ENDED.lastIndex = 0

    if (REGEX_NO_STREAM_FOUND.test(msg)) {
        ipcServer.ipcSend(
            'streamlink-event',
            Result.newError(
                `${msg}`,
                '@ StreamlinkInstance stdout'
            )
        )

        streamManager.closeStream(this.channelName)
            .catch(console.error)
        return
        
    }

    if (REGEX_NO_CHANNEL.test(msg)) {
        ipcServer.ipcSend(
            'streamlink-event',
            Result.newError(
                `${msg}`,
                '@ StreamlinkInstance stdout'
            )
        )

        streamManager.closeStream(this.channelName)
            .catch(console.error)
        return
    }

    if (REGEX_STREAM_ENDED.test(msg)) {
        // send streamlink event on stream end event.
        // disabled for now; don't want a toast notification every
        // time a player is closed.
        //
        // ipcServer.ipcSend(
        //     'streamlink-event',
        //     Result.newOk(`Stream ${this.channelName} closed`)
        // )

        ipcServer.ipcSend('streamlink-stream-closed', this.channelName)

        streamManager.closeStream(this.channelName)
            .catch(console.error)
        return
    }

    // Handle Streamlink Event: Invalid quality

    // match invalid quality option message.
    // use the available qualities list that is printed by streamlink to
    // decide on & launch the closest available stream quality to the user's preference.
    // eg. if available stream qualities are [480p, 720p, 1080p] and user's preference
    // is set to '900p', we'll look through the list, find that 720p is the
    // closest without going over, and attempt to launch at that quality instead of
    // failing to open anything.
    REGEX_STREAM_INVALID_QUALITY.lastIndex = 0
    if (REGEX_STREAM_INVALID_QUALITY.test(msg)) {
        // first, close the existing stream instance
        streamManager.closeStream(this.channelName)
            .catch(console.error)

        
        // match available qualities line
        // index 0 is the full match - contains both of the following groups
        // index 1 is group 1, always the string "Available streams: "
        // index 2 is group 2, string list of qualities. eg:
        // "audio_only, 160p (worst), 360p, 480p, 720p60, etc..."
        REGEX_AVAILABLE_QUALITIES.lastIndex = 0
        let availableQualMatch = REGEX_AVAILABLE_QUALITIES.exec(msg)

        // this shouldnt happen, but if it does, for now just fail
        if (availableQualMatch == null) {
            console.error('Err: availableQualMatch is null or undefined; no available quality options to choose from')
            return
        }

        // full match (string list of qualities) lives at index 2
        // turn it into an array of quality strings.
        // eg ['audio_only', '160p (worst)', '360p', '480p', '720p60', etc...]
        let availableStrs = availableQualMatch[2].split(', ')

        // build arrays of resolutions and framerates out of each quality string.
        // framerates default to 30 if not specified (eg a quality string of '480p'
        // will be represented in the arrays as [480] [30] - the indices will line up)
        let availableResolutions = []
        let availableFramerates = []

        availableStrs.forEach(qual => {
            // return the resolution string (match array index 0) if a match is found,
            // otherwise use the number 0 for the resolution and framerate if no match is found.

            // This is to turn things like 'audio_only' into an integer that we can easily ignore later,
            // but lets us keep the length and indicies of the availableResolutions array the
            // same as availableStrs so they line up as expected (as we'll need to access data
            // from availableStrs later).

            // match resolution string (and framerate string, if available) from quality string.
            // if match is null, no resolution or framerate were found.
            // match index 0 holds resolution string, index 1 holds framerate.
            // 
            // example matches:
            // 'audio_only' -> null
            // '480p'       -> ['480']
            // '1080p60'    -> ['1080', '60']
            let m = qual.match(REGEX_NUMBERS_FROM_QUALITY_STR)

            // quality string contains no numbers, default resolution and framerate to 0.
            // we still store values for these unwanted qualities so the indices and
            // lengths of the arrays line up when we read from them later.
            if (m == null) {
                availableResolutions.push(0)
                availableFramerates.push(0)
                return
            }

            // match index 0: resolution string is a number
            // convert to int and store in resolutions array
            availableResolutions.push(parseInt(m[0]))

            // match index 1: framerate - if exists, convert to int and store; otherwise store 0.
            // unspecified framerate here can probably be assumed to be 30, but use 0 instead; same
            // effect when comparing.
            availableFramerates.push(m[1] ? parseInt(m[1]) : 0)
        })

        // get int versions of user's preferred resolution (retrieved from preferences or passed to instance open() call)
        let preferredResInt = parseInt(this.quality.match(REGEX_NUMBERS_FROM_QUALITY_STR)[0])
        let preferredFpsInt = parseInt(this.quality.match(REGEX_NUMBERS_FROM_QUALITY_STR)[1])

        // now that we've got an array of available qualities, we int compare our preferred quality
        // against each and determine the closest available option, which we then use when launching the stream.
        //
        // loop over in reverse order (highest to lowest quality) and compare each to preference.
        // Choose the first quality option that's lower than or equal to preferred.
        for (let i = availableResolutions.length - 1; i >= 0; i--) {
            // if target resolution is lower, open stream
            //
            // if target resolution is the same, make sure framerate is lower.
            // This is to avoid, for example, opening a 1080p60 stream if user's
            // preference is 1080p30, while still opening 1080p30 if the preference
            // is 1080p60 (and 1080p60 isnt available for the stream in question).
            // We will still open higher framerates at a lower fps; 720p60 will open when
            // the user preference is 1080p30 if it's the next lowest available quality.
            //
            // We're conservative to avoid poor performance or over-stressing
            // user's machine when they don't want to.
            
            // skip indices of resolution 0
            if (availableResolutions[i] === 0) continue
            if (
                // open this quality if resolution is lower than preference
                availableResolutions[i] < preferredResInt ||
                // open this quality if resolution is the same and fps is lower
                (availableResolutions[i] === preferredResInt &&
                availableFramerates[i] <= preferredFpsInt)
            ) {
                // the index of the current loop through availableResolutions will
                // correspond to the correct quality string in availableStrs
                let newQual = availableStrs[i].split(' ')[0]
                streamManager.launchStream(this.channelName, newQual)
                    .catch(console.error)
                return
            }
        }

        // if we got here, no qualities could be used.
        // default to "best".
        //
        // this is in a timeout, as otherwise the newly opened process closes itself immediately. not sure why yet. 
        setTimeout(() => {
            console.log('Could not find a suitable quality that is <= preferred. Defaulting to "best".')
            streamManager.launchStream(this.channelName, 'best')
                .catch(console.error)
        }, 1000) // 1 second
    }
}
