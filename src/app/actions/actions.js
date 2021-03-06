import { location } from 'hyperapp-hash-router'
import { actionsSlice as contextMenu } from 'components/global/ContextMenu'
import { actionsSlice as toaster } from 'components/global/Toaster'
import { actionsSlice as modal } from 'components/global/Modal'

// in test mode, set ipc to a placeholder object that throws an error when called.
// we can't use electron modules in our current test setup.
const ipc = process.env.NODE_ENV !== 'test'
      ? require('electron').ipcRenderer
      : { send: _ => { throw new Error('RUNNING IN TEST ENV; DO NOT USE IPC.SEND') } }

export default {
    // global component slices // 
    location: location.actions, // router
    contextMenu,
    toaster,
    modal,

    // misc //

    // update the state with whatever is passed.
    setState: s => s,
    openURLInBrowser: url => ipc.send('open-url-in-browser', url),
    getAllPrefs: () => ipc.send('prefs-get-all'),

    toggleStreamFavorite: name => state => {
        const newFavs = state.prefs['favorite-streams'].slice() || []
        const existingIndex = newFavs.indexOf(name)

        if (existingIndex > -1) {
            newFavs.splice(existingIndex, 1)
        } else {
            newFavs.push(name)
        }

        // update config file
        ipc.send('prefs-set-one', {
            key: 'favorite-streams',
            value: newFavs
        })

        // update local state prefs
        return {
            prefs: Object.assign({}, state.prefs, {
                'favorite-streams': newFavs 
            })
        }
    },

    // logs //
    logs: {
        getAllLogs: () => ipc.send('streamlink-get-all-logs'),

        setAllLogs: logLines => ({ logLines }),

        updateLogsByName: ({ username, line }) => state => {
            const newLines = state.logLines[username]
                  ? [...state.logLines[username], line]
                  : [line]

            return {
                logLines: Object.assign({}, state.logLines, {
                    [username]: newLines
                })
            }
        },
    },

    // twitch //
    refreshToken: () => ipc.send('auth-refresh-token'),
    revokeToken: () => ipc.send('auth-revoke-token'),
    refreshFollowList: () => ipc.send('twitch-get-follow-list'),
    enableFollowListAutoRefresh: () => ipc.send('twitch-enable-follow-list-auto-refresh'),
    disableFollowListAutoRefresh: () => ipc.send('twitch-disable-follow-list-auto-refresh'),
    setFollowListAutoRefreshInterval: minutes => state => {
        // NOTE: this function assumes 'minutes' has been sanitized and
        // validated before being passed!
        
        // update config file
        ipc.send('twitch-set-auto-refresh-follow-list-intvl-minutes', minutes)

        // update app state
        return {
            prefs: Object.assign({}, state.prefs, {
                'auto-refresh-follow-list-intvl-minutes': minutes
            })
        }
    },
    unfollowChannel: ({ channelID, displayName }) => state => {
        ipc.send('twitch-unfollow-channel', { channelID, displayName })

        // remove the unfollowed channel from current state
        let removeIndex
        let newStreams = state.streams.slice()
        for (let i = 0; i < newStreams.length; i++) {
            if (newStreams[i].channel._id === channelID) {
                removeIndex = i
                break
            }
        }

        newStreams.splice(removeIndex, 1)

        return { streams: newStreams }
    },
    openChat: name => ipc.send('open-chat', name),
    closeChat: name => ipc.send('close-chat', name),
    enableAutoOpenChat: () => ipc.send('prefs-set-one', {
        key: 'open-chat-with-stream',
        value: true
    }),
    disableAutoOpenChat: () => ipc.send('prefs-set-one', {
        key: 'open-chat-with-stream',
        value: false
    }),

    // preferences //
    updatePreferredQuality: quality => ipc.send('prefs-set-one', {
        key: 'preferred-stream-quality',
        value: quality
    }),

    // value accepted by this function should be a number; the value of which should be
    // an option in the STREAM_VIEWER_OPTIONS enum (app/util/constants.js).
    // these values should exactly match the values in the core enum,
    // located at core/util.js.
    updateStreamViewer: streamViewerEnumValue => ipc.send('prefs-set-one', {
        key: 'stream-viewer',
        value: streamViewerEnumValue
    }),

    // notifications
    disableLiveNotif: () => ipc.send('prefs-set-one', {
        key: 'live-notification-enabled',
        value: false
    }),

    enableLiveNotif: () => ipc.send('prefs-set-one', {
        key: 'live-notification-enabled',
        value: true
    }),

    // streamlink //
    getOpenStreams: () => ipc.send('streamlink-get-open-streams'),

    closeStream: username => oldState => {
        ipc.send('streamlink-close-stream', username)
        ipc.send('streamlink-get-open-streams', username)
    },

    openStream: ({ channelName, quality }) => (state, actions) => {
        ipc.send('streamlink-open-url', {
            channelName,
            quality: quality || state.prefs['preferred-stream-quality']
        })

        // if open chat with stream is enabled, also open the chat now
        if (state.prefs['open-chat-with-stream']) {
            actions.openChat(channelName)
        }

        // refresh open streams array
        actions.getOpenStreams()
    },

    // open file chooser dialog for streamlink path
    chooseStreamlinkExePath: () => ipc.send('streamlink-choose-exe-path'),

    // follow list pagination
    followListLoadNextPage: () => state => {
        ipc.send('twitch-get-follow-list', state.followListCurrentPageNum + 1)
    },

    getCurrentUser: () => ipc.send('get-current-user'),
}
