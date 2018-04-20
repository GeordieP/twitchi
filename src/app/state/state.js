import { location } from '@hyperapp/router'
import { stateSlice as contextMenu } from 'components/global/ContextMenu'
import { stateSlice as toaster } from 'components/global/Toaster'

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
