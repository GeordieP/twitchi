const spawn = require('child_process').spawn
const commandExistsSync = require('command-exists').sync
const { dialog } = require('electron')
const config = require('./config')
const fs = require('fs-extra')

// *nix pasths
const EXE_PATHS_NIX = [
    'streamlink',
    '/usr/local/bin/streamlink',
    '/usr/bin/streamlink',
    '/bin/streamlink',
]

// windows paths
const EXE_PATHS_WIN = [
    'C:\\Program Files (x86)\\Streamlink\\bin\\streamlink.exe',
    'C:\\Program Files\\Streamlink\\bin\\streamlink.exe'
]

const REGEX_IS_FILE_PATH = /[/\\]/
const checkSync = str =>
    REGEX_IS_FILE_PATH.test(str)
        ? fs.pathExistsSync(str)
        : commandExistsSync(str)

module.exports.checkForExpectedExes = () => new Promise(async (resolve, reject) => {
    let paths = (process.platform === 'win32') ? EXE_PATHS_WIN : EXE_PATHS_NIX

    for (let i = 0; i < paths.length; i++) {
        // skip path on check returning false
        if (!checkSync(paths[i])) continue

        // success; resolve this path and return fn, skipping reject call
        resolve(paths[i])
        return
    }

    reject(new Error('Could not find a valid Streamlink path.'))
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
            buttons: ['OK', 'Cancel'],
            defaultId: 0,
            cancelId: 1,
            title: 'Could not locate Streamlink',
            message: 'Twitchi could not find your Streamlink install directory. Click OK to choose a path to your Streamlink executable.'
        },

        (btnIndex) => {
            // ok button
            if (btnIndex === 0) {
                showFileChooser()
            } else {
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
