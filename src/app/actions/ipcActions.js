import { ipcRenderer as ipc } from 'electron'
import Result from '@geordiep/result'

// parseResponse: parse from JSON, then turn back into Result object
// (adds back Result methods that were lost in JSON string)
const parseResponse = res => Result.fromJson(JSON.parse(res))
const handleErr = console.error

// send initial IPC messages
export const init = () => {
    ipc.send('prefs-get-all')
    ipc.send('app-get-version')
}

export const listen = dispatch => {
    ipc.on('prefs-get-all-res', (evt, res) => {
        try {
            const prefs = parseResponse(res).expect()
            dispatch.setState({ prefs })
        } catch(e) {
            handleErr(e)
        }
    })

    ipc.on('auth-refresh-token-res', (evt, res) => {
        try {
            res = parseResponse(res)
            if (res.isError()) throw res

            console.log('token refreshed successfully')
        } catch(e) {
            handleErr(e)
        }
    })

    ipc.on('twitch-get-follow-list-res', (evt, res) => {
        try {
            const { streams } = parseResponse(res).expect()

            // append current time to end of each medium 'preview' url.
            // this has no effect on loading the image, but will ensure that
            // with each refresh we don't display thumbnails that have been
            // cached by the Electron webview.
            const uniqStr = '?' + Date.now()
            for (let i = 0; i < streams.length; i++) {
                streams[i].preview.medium += uniqStr
            }

            dispatch.setState({ streams })
        } catch(e) {
            handleErr(e)
        }
    })

    ipc.on('app-get-version-res', (evt, res) => {
        try {
            const appVersion = parseResponse(res).expect()
            dispatch.setState({ appVersion })
        } catch(e) {
            handleErr(e)
        }
    })
}
