import { location } from '@hyperapp/router'
import { stateSlice as contextMenu } from 'components/ContextMenu'
import { stateSlice as toaster } from 'components/Toaster'

export default {
    // global component slices //
    location: location.state, // router
    contextMenu,
    toaster,

    // misc //
    appVersion: 'x.x.x',
    prefs: {},
    streams: [],
    logs: {
        logLines: {},
    },
    refreshingFollowList: false,
}
