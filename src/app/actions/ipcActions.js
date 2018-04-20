import { ipcRenderer as ipc } from 'electron'
import Result from '@geordiep/result'

import { ToastTypes } from 'components/global/Toaster'

// parseResponse: turn object recvd from core IPC back into proper Result object
// (adds back Result methods that were lost in transmission)
const parseResponse = res => Result.fromJson(res)

// handler function for streamlink stdout log lines
// declare as module global so exported functions can use it,
// but define inside listen so it has access to dispatch.
// we keep this as a separate function so we can reference it during listener removal
let logLineListener

// send initial IPC messages
export const init = () => {
    ipc.send('prefs-get-all')
    ipc.send('app-get-version')
}

export const listen = dispatch => {
    // show the user a toast notification, and log the error to the console
    const handleErr = (title, e) => {
        // handle as Result object or Error object
        const body = (e.constructor === Result)
            ? `${e.origin}: ${e.value}`
            : e

        console.error(body)

        dispatch.toaster.showToast({
            title,
            type: ToastTypes.ERROR,
            body
        })
    }

    // handler function for stdout lines coming from core
    logLineListener = (evt, newLine) => {
        try {
            dispatch.logs.updateLogsByName(newLine)
        } catch(e) {
            console.error(e)
        }
    }

    // ipc listeners //

    // currently there's no app action for sending prefs-get-all
    // we only send it manually from this module (init and in some result handlers)
    ipc.on('prefs-get-all-res', (evt, res) => {
        try {
            const prefs = parseResponse(res).expect()
            dispatch.setState({ prefs })
        } catch(e) {
            handleErr('An error occurred when loading preferences', e)
        }
    })

    ipc.on('prefs-set-one-res', (evt, res) => {
        try {
            parseResponse(res).expect()
            // set result was success, send request for all prefs
            // so we can update our state prefs object
            ipc.send('prefs-get-all')
        } catch(e) {
            handleErr('An error occurred when saving preferences', e)
        }
    })

    ipc.on('auth-refresh-token-res', (evt, res) => {
        try {
            parseResponse(res).expect()

            dispatch.toaster.showToast({
                title: 'Login successful',
                type: ToastTypes.SUCCESS
            })

            dispatch.refreshFollowList()
        } catch(e) {
            handleErr('An error occurred when logging in', e)
        }
    })

    ipc.on('auth-revoke-token-res', (evt, res) => {
        try {
            parseResponse(res).expect()

            dispatch.toaster.showToast({
                title: 'Logout successful',
                type: ToastTypes.SUCCESS
            })

            dispatch.setState({ streams: [] })
        } catch(e) {
            handleErr('An error occurred when logging out', e)
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
            handleErr('An error occurred during follow list refresh', e)
        }
    })

    ipc.on('twitch-enable-follow-list-auto-refresh-res', (evt, res) => {
        try {
            parseResponse(res).expect()

            // successfully enabled auto refresh, update local prefs object
            ipc.send('prefs-get-all')
        } catch(e) {
            handleErr('An error occurred when enabling auto refresh', e)
        }
    })

    ipc.on('twitch-disable-follow-list-auto-refresh-res', (evt, res) => {
        try {
            parseResponse(res).expect()

            // successfully disabled auto refresh, update local prefs object
            ipc.send('prefs-get-all')
        } catch(e) {
            handleErr('An error occurred when disabling auto refresh', e)
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

    ipc.on('streamlink-open-url-res', (evt, res) => {
        try {
            const openedName = parseResponse(res).expect()
        } catch(e) {
            handleErr('An error occurred when opening the stream', e)
        }
    })

    ipc.on('streamlink-close-stream-res', (evt, res) => {
        try {
            const openedName = parseResponse(res).expect()
        } catch(e) {
            handleErr('An error occurred when closing the stream', e)
        }
    })

    ipc.on('streamlink-get-all-logs-res', (evt, res) => {
        try {
            const logs = parseResponse(res).expect()
            dispatch.logs.setAllLogs(logs)
        } catch(e) {
            handleErr('An error occurred when loading streamlink logs', e)
        }
    })

    ipc.on('streamlink-get-open-streams-res', (evt, res) => {
        try {
            const openStreams = parseResponse(res).expect()
            dispatch.setState({ openStreams })
        } catch(e) {
            handleErr('An error occurred when retrieving open streams', e)
        }
    })

    ipc.on('open-url-in-browser-res', (evt, res) => {
        try {
            parseResponse(res).expect()
        } catch(e) {
            handleErr('An error occurred when opening the page in your browser', e)
        }
    })

    ipc.on('twitch-set-auto-refresh-follow-list-intvl-minutes-res', (evt, res) => {
        try {
            parseResponse(res).expect()
        } catch(e) {
            handleErr('An error occurred when setting the auto refresh interval', e)
        }
    })

    // events
    ipc.on('event-twitch-follow-list-refresh-begin', evt => {
        dispatch.setState({ refreshingFollowList: true })
    })

    ipc.on('event-twitch-follow-list-refresh-finish', evt => {
        dispatch.setState({ refreshingFollowList: false })
    })
}

// subscribe to new streamlink log messages coming from core
export const logsSubscribe = () => {
    // listen for incoming messages
    ipc.on('streamlink-process-stdout-line', logLineListener)

    // tell core we're listening
    ipc.send('app-subscribe-logs')
}

// unsubscribe from streamlink log messages
export const logsUnsubscribe = () => {
    // stop listening for incoming messages
    ipc.removeListener('streamlink-process-stdout-line', logLineListener)

    // tell core we've stopped listening
    ipc.send('app-unsubscribe-logs')
}
