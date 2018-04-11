// in test mode, set ipc to a placeholder object that throws an error when called.
// we can't use electron modules in our current test setup.
const ipc = process.env.NODE_ENV !== 'test'
      ? require('electron').ipcRenderer
      : { send: _ => { throw new Error('RUNNING IN TEST ENV; DO NOT USE IPC.SEND') } }

export default {
    // update the state with whatever is passed.
    setState: s => s,

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
    openStream: ({ channelName, channelURL }) => (state, actions) => {
        ipc.send('streamlink-open-url', {
            channelName,
            channelURL,
            quality: state.prefs['preferred-stream-quality']
        })
    }
}
