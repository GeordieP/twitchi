import { location } from '@hyperapp/router'
import { stateSlice as contextMenu } from 'components/ContextMenu'

export default {
    // global component slices //
    location: location.state, // router
    contextMenu,

    // misc //
    appVersion: 'x.x.x',
    prefs: {},
    streams: [],
    logs: {
        logLines: {},
    },
    refreshingFollowList: false,
}
