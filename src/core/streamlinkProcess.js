const spawn = require('child_process').spawn
const commandExistsSync = require('command-exists').sync
const { dialog } = require('electron')
const config = require('./config')
const fs = require('fs-extra')
const { StreamViewerTypes } = require('./util')

// paths array based on platform (windows or *nix)
const PLATFORM_PATHS = (process.platform === 'win32') ? [
    // windows paths
    'streamlink',
    'C:\\Program Files (x86)\\Streamlink\\bin\\streamlink.exe',
    'C:\\Program Files\\Streamlink\\bin\\streamlink.exe'
] : [
    // nix paths
    'streamlink',
    '/usr/local/bin/streamlink',
    '/usr/bin/streamlink',
    '/bin/streamlink',
]

const REGEX_IS_FILE_PATH = /[/\\]/
const checkSync = str =>
    REGEX_IS_FILE_PATH.test(str)
        ? fs.pathExistsSync(str)
        : commandExistsSync(str)

module.exports.checkForExpectedExes = () => new Promise(async (resolve, reject) => {
    for (let i = 0; i < PLATFORM_PATHS.length; i++) {
        // skip path on check returning false
        if (!checkSync(PLATFORM_PATHS[i])) continue

        // success; resolve this path and return fn, skipping reject call
        resolve(PLATFORM_PATHS[i])
        return
    }

    reject(new Error('Could not find a valid Streamlink path.'))
})

module.exports.checkOptsForExePath = () => new Promise((resolve, reject) => {
    const optsPath = config.get('streamlink-exe-path')

    if (!optsPath) {
        reject('No path found in options file.')
        return
    }

    resolve(optsPath)
})

module.exports.checkAndSetExePath = path => {
    if (path == null || path.length === 0) {
        throw new Error('Could not set streamlink path: Path was empty or invalid.')
    }

    if (!checkSync(path)) {
        throw 'Could not set streamlink path: File or command does not exist.'
    }

    module.exports.setExePath(path)
}

module.exports.setExePath = path => {
    if (path == null || path.length === 0) {
        throw new Error('Could not set streamlink path: Path was empty or invalid.')
    }

    config.set('streamlink-exe-path', path)
}

module.exports.askUserForPath = async (onlyFileChooser = true) => new Promise((resolve, reject) => {
    const showFileChooser = () => dialog.showOpenDialog(
        {
            title: 'Choose Streamlink executable',
            properties: ['openFile', 'showHiddenFiles']
        },

        // on file chosen, resolve the first file
        (files) => {
            if (files == null || files.length === 0) {
                reject('No Streamlink path selected: File picker was closed.')
                return
            }

            resolve(files[0])
        }
    )

    // skip showing the message box if onlyFileChooser flag is set;
    // return early after showing file chooser
    if (onlyFileChooser) {
        showFileChooser()
        return
    }

    // show info message box
    // accepting the message box will display the file chooser
    dialog.showMessageBox(
        {
            type: 'info',
            buttons: ['OK', 'Use Twitch Player', 'Cancel'],
            defaultId: 0,
            cancelId: 1,
            title: 'Could not locate Streamlink',
            message: 'Twitchi could not find your Streamlink install directory. ' +
                     'Click "OK" to choose a path to your Streamlink executable.\n\n' +
                     'If you would rather use the default Twitch player inside a Twitchi pop-out window, ' +
                     'click "Use Twitch Player".\n\n' +
                     'This option can be changed layer in the preferences page.'
        },

        (btnIndex) => {
            switch(btnIndex) {
                // OK
                case 0:
                    showFileChooser()
                    break
                // Use Twitch Player
                case 1:
                    config.set('stream-viewer', StreamViewerTypes.ELECTRON)
                    resolve()
                    return
                // Cancel/Something went wrong
                default:
                    reject('File picker message box was cancelled.')

            }
        }
    )
})

module.exports.launchStreamlink = args => new Promise(async (resolve, reject) => {
    let path = config.get('streamlink-exe-path')

    if (path == null || path.length === 0) {
        // ask user for new path, and check & save it
        try {
            path = await module.exports.askUserForPath(false)
            module.exports.checkAndSetExePath(path)
        } catch(e) {
            reject(e)
            return
        }
    }

    resolve(spawn(path, args))
})
