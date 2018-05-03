import { app, h } from 'hyperapp'
import { Route, Switch, location } from 'hyperapp-hash-router'

import defaultState from 'state/state'
import actions from 'actions/actions'
import * as ipcActions from 'actions/ipcActions'

// components
import Index from 'pages/index'
import Preferences from 'pages/preferences'
import LaunchStream from 'pages/launchStream'
import Logs from 'pages/logs'

// global components:
// persistent, app-wide components that handle their own visibility
import ContextMenu from 'components/global/ContextMenu'
import Toaster from 'components/global/Toaster'
import Modal from 'components/global/Modal'

const view = (state, actions) => (
    <div id="allWrap">
        {/* GLOBAL COMPONENTS */}
        <ContextMenu />
        <Toaster />
        <Modal />

        {/* ROUTER */}
        <Switch>
            <Route path='/' render={ Index } />
            <Route path='/preferences' render={ Preferences } />
            <Route path='/launchStream' render={ LaunchStream } />
            <Route path='/logs' render={ Logs } />
            <Route render={ Index } />
        </Switch>
    </div>
)

const dispatch = app(
    defaultState,
    actions,
    view,
    document.body
)

// hyperapp router unsubscribe
const unsubscribe = location.subscribe(dispatch.location)

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
