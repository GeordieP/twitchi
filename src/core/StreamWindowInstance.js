'use strict'

const { BrowserWindow } = require('electron')

const ipcServer = require('./ipcServer')
const streamManager = require('./streamManager')
const { InstanceStates } = require('./util')


// max number of log lines for a process to keep
const MAX_LOG_LINES = 50

function StreamWindowInstance(name) {
    this.state = InstanceStates.IDLE
    this.channelName = name
    this.channelURL = `https://player.twitch.tv/?volume=25!muted&channel=${this.channelName}`
    this.logLines = []
    this.streamWindow = {}
}

StreamWindowInstance.prototype.logLine = function(line) {
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

StreamWindowInstance.prototype.open = function() {
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

            this.streamWindow = new BrowserWindow({
                title: this.channelName,
                width: 1280,
                height: 720,
                autoHideMenuBar: true,
                nodeIntegration: false,
            })

            this.streamWindow.setMenu(null)
            this.streamWindow.loadURL(this.channelURL)

            this.state = InstanceStates.OPEN

            this.streamWindow.on('closed', () => {
                this.logLine(`${this.channelName} Twitch player window closed.`)
                ipcServer.ipcSend('streamlink-stream-closed', this.channelName)
                this.streamWindow = null
                streamManager.closeStream(this.channelName)
                    .catch(console.error)
            })

            resolve()
        } catch (e) {
            reject(e)
        }
    })
}

StreamWindowInstance.prototype.close = function() {
    return new Promise(async (resolve, reject) => {
        // if we're in any state but open, resolve;
        // we don't need to do any extra work.
        // open is the only 'closable' state.
        if (this.state !== InstanceStates.OPEN) {
            resolve()
            return
        }

        try {
            if (this.streamWindow != null) {
                this.streamWindow.close()
            }
            this.streamWindow = null
            this.state = InstanceStates.IDLE
        } catch(e) {
            reject(e)
            return
        }

        resolve()
    })
}

StreamWindowInstance.prototype.getLogs = function() {
    return this.logLines
}

StreamWindowInstance.prototype.getState = function() {
    return this.state
}

StreamWindowInstance.prototype.setStateIdle = function() {
    this.state = InstanceStates.IDLE
}

StreamWindowInstance.prototype.setStateDeleteQueued = function() {
    this.state = InstanceStates.DELETEQUEUED
}

module.exports = StreamWindowInstance
