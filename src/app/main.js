import { app, h } from 'hyperapp'
import { Router, withTlRouter } from '@geordiep/h_tlrouter'

import defaultState from 'state/state'
import actions from 'actions/actions'

// components
import Index from 'pages/index'
import Preferences from 'pages/preferences'
import LaunchStream from 'pages/launchStream'
import Logs from 'pages/logs'

import * as ipcActions from 'actions/ipcActions'

const router = Router({
    '/': Index,
    '/preferences': Preferences,
    '/launchStream': LaunchStream,
    '/logs': Logs,
})

// create app 
const dispatch = withTlRouter(app)(
    defaultState,
    actions,
    router,
    document.body
)

// set up IPC listeners; map IPC message handlers to app actions
ipcActions.listen(dispatch)

// send initial IPC messages to backend to get things rolling
ipcActions.init()

// in production mode (built application), send get follow list request on startup
if (process.env.NODE_ENV === 'production') {
    dispatch.refreshFollowList()
}

//
//

// WEBPACK HOT RELOADING
if (module.hot) {
    // for hot module replacement, even though it's not entirely working.
    // webpack seems to be updating the modules, but the app is not being
    // re-rendered when something changes.
    // HMR works for styles, so let's leave hot reloading functionality in for that benefit anyway.
    // Maybe revisit this problem later.
    // Useful resource: https://github.com/andyrj/hyperapp-webpack-hmr
    // above repo shows essentially the setup in this app.
    //
    // module.hot.accept('./appMain', function() {
    //     dispatch = appMain(dispatch.getState())
    // })

    // this call will reload everything; don't bother maintaining state because of above issues.
    // still allowing HMR so we can update styles without resetting state.
    module.hot.accept()
}
