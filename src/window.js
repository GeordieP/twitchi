'use strict'

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const ipcServer = require('./core/ipcServer')

let mainWindow

app.on('ready', start)

app.on('activate', () => {
    if (mainWindow == null) start()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

function start() {
    mainWindow = new BrowserWindow({
        title: 'Twitchi',
        width: 1100, height: 730,
        autoHideMenuBar: false,
        backgroundColor: "#000000",
        webPreferences: {
            scrollBounce: true
        }
    })

    // begin listening for ipc messages from the renderer process
    ipcServer.start(mainWindow)

    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:8080')
        // mainWindow.setMenu(null)
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadURL('file://' + path.resolve(__dirname, 'index.html'))
        mainWindow.setMenu(null)
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

// display exceptions in electron error message box
process.on('uncaughtException', e => {
    let msg

    // add error codes here to customize messages
    switch(e.code) {
    // case 'ENOENT':
    default:
        // use Electron's default message
        msg = 'Uncaught Exception:\n' + e.stack
    }

    dialog.showErrorBox('A JavaScript error occurred in the main process', msg)
})
