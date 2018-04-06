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
        dispatch.setState({ streams: res.value.streams })
    })

    ipc.on('app-get-version-res', (e, res) => {
        res = JSON.parse(res)
        dispatch.setState({ appVersion: res.value })
    })
}
