import { location } from 'hyperapp-hash-router'
import { stateSlice as contextMenu } from 'components/global/ContextMenu'
import { stateSlice as toaster } from 'components/global/Toaster'
import { stateSlice as modal } from 'components/global/Modal'

export default {
    // global component slices //
    location: location.state, // router
    contextMenu,
    toaster,
    modal,

    // misc slices
    logs: {
        logLines: {},
    },

    // misc //
    appVersion: 'x.x.x',
    prefs: {},
    streams: [],
    openStreams: [],
    refreshingFollowList: false,
    followListCurrentPageNum: 0,
    followListNumExtraPages: 0
}
