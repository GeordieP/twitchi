// in test mode, set ipc to a placeholder object that throws an error when called.
// we can't use electron modules in our current test setup.
const ipc = process.env.NODE_ENV !== 'test'
      ? require('electron').ipcRenderer
      : { send: _ => { throw new Error('RUNNING IN TEST ENV; DO NOT USE IPC.SEND') } }

export default {
    // update the state with whatever is passed.
    setState: s => s,

    // MISC //
    getOpenStreams: () => ipc.send('streamlink-get-open-streams'),

    // LOGS //
    logs: {
        getAllLogs: () => ipc.send('streamlink-get-all-logs'),

        setAllLogs: logLines => ({ logLines }),

        removeLogsByName: username => state => {
            ipc.send('streamlink-close-stream', username)
            // const newLines = Object.assign({}, state.logLines)
            // delete newLines[username]
            // return newLines
        },

        updateLogsByName: ({ username, line }) => state => {
            const newLines = state.logLines[username]
                  ? [...state.logLines[username], line]
                  : [line]

            return {
                logLines: {
                    [username]: newLines
                }
            }
        },
    },

    // TWITCH //
    refreshToken: () => ipc.send('auth-refresh-token'),
    revokeToken: () => ipc.send('auth-revoke-token'),
    refreshFollowList: () => ipc.send('twitch-get-follow-list'),

    // PREFERENCES //
    updatePreferredQuality: quality => ipc.send('prefs-set-one', {
        key: 'preferred-stream-quality',
        value: quality
    }),

    // STREAMLINK //
    openStream: ({ channelName, channelURL, quality }) => (state, actions) => {
        ipc.send('streamlink-open-url', {
            channelName,
            channelURL,
            quality: quality || state.prefs['preferred-stream-quality']
        })
    },
}
