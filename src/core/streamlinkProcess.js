const spawn = require('child_process').spawn
const commandExists = require('command-exists')

// name of process to spawn - used to be livestreamer, now streamlink
// TODO: allow changing this?
// // if we stop using streamlink, need to update a lot of var names (mainly this file and ipcserver)
let STREAMLINK_PROCESS_NAME = ''

// *nix pasths
const EXE_PATHS_NIX = [
    'streamlink',
    '/usr/bin/streamlink',
    '/usr/local/bin/streamlink',
    '/bin/streamlink',
]

// windows paths
const EXE_PATHS_WIN = [
    'C:\\Program Files (x86)\\Streamlink\\bin\\streamlink.exe',
    'C:\\Program Files\\Streamlink\\bin\\streamlink.exe'
]

module.exports.checkForExpectedExes = () => new Promise((resolve, reject) => {
    // TODO determine platform, for now use nix
    let paths = EXE_PATHS_NIX

    let validPath
    for (let i = 0; i < paths.length) {
        try {
            // if commandExists resolves, the command exists at this path and we can use it.
            // it will resolve with the path it was given.
            validPath = commandExists(paths[i])

            // resolve the valid path, break loop and return from function, so we don't reject later.
            resolve(validPath)
            return
        } catch(e) {
            // error; path was not valid, continue on
            continue
        }
    }

    if (validPath == null) {
        reject(new Error('Could not find a valid streamlink path.'))
    }
})

module.exports.setStreamlinkPath = path => {
    STREAMLINK_PROCESS_NAME = path
}

module.exports.launchStreamlink = args =>
    spawn(STREAMLINK_PROCESS_NAME, args)
