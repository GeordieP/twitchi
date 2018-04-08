import { ipcRenderer as ipc } from 'electron'

// send initial IPC messages
export const init = () => {
    ipc.send('prefs-get-all')
    ipc.send('app-get-version')
}

export const listen = dispatch => {
    ipc.on('prefs-get-all-res', (e, res) => {
        res = JSON.parse(res)
        dispatch.setState({ prefs: res.value })
    })

    ipc.on('twitch-get-follow-list-res', (e, res) => {
        res = JSON.parse(res)
        const { streams } = res.value

        // append current time to end of each medium 'preview' url.
        // this has no effect on loading the image, but will ensure that
        // with each refresh we don't display thumbnails that have been
        // cached by the Electron webview.
        const uniqStr = '?' + Date.now()
        for (let i = 0; i < streams.length; i++) {
            streams[i].preview.medium += uniqStr
        }
        
        dispatch.setState({ streams })
    })

    ipc.on('app-get-version-res', (e, res) => {
        res = JSON.parse(res)
        dispatch.setState({ appVersion: res.value })
    })
}
