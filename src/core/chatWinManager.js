const { BrowserWindow } = require('electron')

// keep track of all chat windows
const activeWindows = {}

const createChatURL = name => `https://www.twitch.tv/popout/${name}/chat?popout=`

module.exports.openChat = name => {
    // don't re-open chat windows that are already open
    if (activeWindows[name] != null) {
        return
    }

    const window = new BrowserWindow({
        title: 'Twitch Chat: ' + name,
        width: 340,
        height: 621,
        autoHideMenuBar: true,
        nodeIntegration: false,
    })

    window.setMenu(null)
    window.loadURL(createChatURL(name))

    window.on('closed', () => {
        if (activeWindows[name] != null) {
            delete activeWindows[name]
        }
    })

    activeWindows[name] = window
}

module.exports.closeChat = name => {
    if (activeWindows[name] == null) {
        return
    }

    activeWindows[name].close()
    delete activeWindows[name]
}
