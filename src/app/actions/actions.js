// in test mode, set ipc to a placeholder object that throws an error when called.
// we can't use electron modules in our current test setup.
const ipc = process.env.NODE_ENV !== 'test'
      ? require('electron').ipcRenderer
      : { send: _ => { throw new Error('RUNNING IN TEST ENV; DO NOT USE IPC.SEND') } }

export default {
    // update the state with whatever is passed.
    setState: s => s,

    // MISC //
    openURLInBrowser: url => ipc.send('open-url-in-browser', url),

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

    // LOGS //
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

    // TWITCH //
    refreshToken: () => ipc.send('auth-refresh-token'),
    revokeToken: () => ipc.send('auth-revoke-token'),
    refreshFollowList: () => ipc.send('twitch-get-follow-list'),
    enableFollowListAutoRefresh: () => ipc.send('twitch-enable-follow-list-auto-refresh'),
    disableFollowListAutoRefresh: () => ipc.send('twitch-disable-follow-list-auto-refresh'),

    // PREFERENCES //
    updatePreferredQuality: quality => ipc.send('prefs-set-one', {
        key: 'preferred-stream-quality',
        value: quality
    }),

    // STREAMLINK //
    getOpenStreams: () => ipc.send('streamlink-get-open-streams'),

    closeStream: username => oldState => {
        ipc.send('streamlink-close-stream', username)
        ipc.send('streamlink-get-open-streams', username)
    },

    openStream: ({ channelName, channelURL, quality }) => (state, actions) => {
        ipc.send('streamlink-open-url', {
            channelName,
            channelURL,
            quality: quality || state.prefs['preferred-stream-quality']
        })
    },

    // CONTEXT MENU //
    contextMenu: {
        show: ({ event, items }) => ({
            items,
            position: { x: event.clientX, y: event.clientY },
            visible: true,
        }),
        hide: () => ({
            visible: false,
        }),
    }
}
