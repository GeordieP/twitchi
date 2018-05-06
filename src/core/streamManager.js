'use strict'

const StreamlinkInstance = require('./StreamlinkInstance')
const StreamWindowInstance = require('./StreamWindowInstance')
const { InstanceStates } = require('./util')

// keep track of all stream instances
const activeInstances = {}

// keep track of stream instance delete timeouts
const deleteTimeouts = {}

// timeout in minutes
const INSTANCE_DELETE_TIMEOUT_MINUTES = 5
const INSTANCE_DELETE_TIMEOUT = 1000 * 60 * INSTANCE_DELETE_TIMEOUT_MINUTES

// create stream instance
module.exports.createStream = (name, url) => new Promise((resolve, reject) => {
    try {
        // stream is already open, do nothing
        if (activeInstances[name] != null) {
            resolve()
            return
        }

        // activeInstances[name] = new StreamlinkInstance(name, url)
        activeInstances[name] = new StreamWindowInstance(name, url)
        resolve()
    } catch(e) {
        reject(e)
    }
})

// create and immediately open stream
module.exports.launchStream = (name, quality) => new Promise(async (resolve, reject) => {
    try {
        // create stream if it's not open yet
        if (activeInstances[name] == null) {
            // create the instance and store it in activeInstances
            await module.exports.createStream()
        }

        await activeInstances[name].open(quality)

        resolve()
    } catch(e) {
        reject(e)
    }
})

module.exports.openStream = (name, quality) => new Promise(async (resolve, reject) => {
    try {
        if (activeInstances[name] == null) {
            throw new Error('Could not open stream '+name+': No instance exists. Make sure to call createStream first.')
        }

        await activeInstances[name].open(quality)

        resolve()
    } catch(e) {
        reject(e)
    }
})

module.exports.closeStream = (name, delay = INSTANCE_DELETE_TIMEOUT) => new Promise(async (resolve, reject) => {
    try {
        // fail silently if no instance exists;
        // this function is called many times by StreamlinkInstance event handlers, sometimes
        // after the instance has already been removed and marked for GC
        if (activeInstances[name] == null) {
            resolve()
            return
        }

        const instanceState = activeInstances[name].getState()

        if (instanceState === InstanceStates.OPEN) {
            await activeInstances[name].close()
        }

        // do not attempt to delete an instance that's not open or idle
        if (instanceState === InstanceStates.OPEN ||
            instanceState === InstanceStates.IDLE) {
            await module.exports.deleteAfter(name, delay)
        }

        resolve()
    } catch(e) {
        reject(e)
    }
})

module.exports.deleteAfter = (name, delay = INSTANCE_DELETE_TIMEOUT) => new Promise(async (resolve, reject) => {
    try {
        if (activeInstances[name] == null) {
            throw new Error('Could not queue instance '+name+' for deletion: No active instance found')
        }

        activeInstances[name].setStateDeleteQueued()

        // if a timeout is already running, clear it so we can overwrite it with new one
        if (deleteTimeouts[name] != null) {
            clearTimeout(deleteTimeouts[name])
            delete deleteTimeouts[name]
        }

        // 0 delay, delete immediately; don't bother setting a timer
        if (delay === 0) {
            await activeInstances[name].close()
            delete activeInstances[name]
        } else {
            // notify any users watching the logs page that the instance will be cleaned up
            activeInstances[name].logLine('\n[TWITCHI]: Stream is closing.\n')
            activeInstances[name].logLine('[TWITCHI]: Stream log messages will be cleaned up in '+INSTANCE_DELETE_TIMEOUT_MINUTES+' minutes.\n')

            // start delete timeout
            deleteTimeouts[name] = setTimeout(finalDelete.bind(null, name), delay)
        }

        resolve()
    } catch(e) {
        reject(e)
    }
})

module.exports.cancelDeleteAfter = name => new Promise(async (resolve, reject) => {
    try {
        if (deleteTimeouts[name] == null) {
            throw new Error('Could not cancel deletion for instance '+name+': No delete timeout found')
        }

        if (activeInstances[name] == null) {
            throw new Error('Could not cancel deletion for instance '+name+': No active instance found')
        }

        if (activeInstances[name].getState() !== InstanceStates.DELETEQUEUED) {
            throw new Error('Could not cancel deletion for instance '+name+': Instance was in a state other than DELETEQUEUED')
        }

        clearTimeout(deleteTimeouts[name])
        delete deleteTimeouts[name]
        activeInstances[name].setStateIdle()
        activeInstances[name].logLine('\n[TWITCHI]: Cleanup for stream '+name+' has been cancelled.\n')

        resolve()
    } catch(e) {
        reject(e)
    }
})

function finalDelete(name) {
    return new Promise(async (resolve, reject) => {
        try {
            if (activeInstances[name] == null) {
                throw new Error('Could not delete instance '+name+': No active instance found')
            }

            if (!deleteTimeouts[name]) {
                throw new Error('Could not delete instance '+name+': No delete timeout found')
            }

            if (activeInstances[name].getState() !== InstanceStates.DELETEQUEUED) {
                throw new Error('Could not delete instance '+name+'; Instance state was not ')
            }

            await activeInstances[name].close()
            delete deleteTimeouts[name]
            delete activeInstances[name]

            resolve()
        } catch(e) {
            reject(e)
        }
    })
}

module.exports.getAllLogs = () => new Promise((resolve, reject) => {
    // build an object containing logs of all stream instances that we know about.
    let allLogs = {}
    let keys

    try {
        // use for loops here for speed; logs may be big and there may be a lot,
        // so we need all the perf we can get.
        keys = Object.keys(activeInstances)
        if (keys.length > 0) {
            for (let i = 0; i < keys.length; i++) {
                allLogs[keys[i]] = activeInstances[keys[i]].getLogs()
            }
        }

        resolve(allLogs)
    } catch(e) {
        reject(e)
    }
})

module.exports.getOpenStreams = () => new Promise(resolve => {
    if (activeInstances == null || activeInstances.length === 0) {
        resolve([])
    }

    let names = []
    let keys = Object.keys(activeInstances)
    for (let i = 0; i < keys.length; i++) {
        if (activeInstances[keys[i]].getState() === InstanceStates.OPEN) {
            names.push(keys[i])
        }
    }

    resolve(names)
})

