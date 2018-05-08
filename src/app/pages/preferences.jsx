import { h } from 'hyperapp'
import { QUALITY_OPTIONS, STREAM_VIEWER_OPTIONS } from 'util/constants'

import NavBar from 'components/NavBar'

export default () => (state, actions) => {
    const onQualChange = e => actions.updatePreferredQuality(e.target.value)

    const onChangeAutoRefreshDuration = e => {
        let minutes = e.target.value

        if (minutes == null || isNaN(minutes)) {
            console.error('Time value must be a number no lower than 3.')
            return
        }

        if (minutes.constructor !== Number) {
            minutes = parseInt(minutes)
        }

        if (minutes < 3) {
            console.error('Time value must be a number no lower than 3.')
            return
        }

        actions.setFollowListAutoRefreshInterval(minutes)
    }

    const onChangeStreamViewer = e => {
        // convert the reader-friendly key (field value) from the event
        // into its corresponding enum value before sending it to the action.
        const val = STREAM_VIEWER_OPTIONS[e.target.value]
        actions.updateStreamViewer(val)
    }

    // certain things need to be refreshed every time we load the preferences page
    const onMount = () => {
        actions.getAllPrefs()
        actions.getCurrentUser()
    }

    return (
        <main id='main-preferences' key='main-preferences' oncreate={onMount}>
            <NavBar/>

            <section className='content'>
                <div className='page'>
                    <h1 style={{marginBottom: '30px'}}>Preferences</h1>

                    <h2>Stream Options</h2>
                    <div className='pageSection'>
                        <ul>
                            <li>
                                <h3>Live Notification</h3>
                                <input
                                    type='checkbox'
                                    id='liveNotifCheckbox'
                                    checked={state.prefs['live-notification-enabled']}
                                    onchange={state.prefs['live-notification-enabled'] ? actions.disableLiveNotif : actions.enableLiveNotif}
                                />
                                <label htmlFor='liveNotifCheckbox'>Show a system notification when streams you follow go live</label>
                            </li>

                            <li>
                                <h3>Chat</h3>
                                <input
                                    type='checkbox'
                                    id='autoOpenChatCheckbox'
                                    checked={state.prefs['open-chat-with-stream']}
                                    onchange={state.prefs['open-chat-with-stream'] ? actions.disableAutoOpenChat : actions.enableAutoOpenChat}
                                />
                                <label htmlFor='autoOpenChatCheckbox'>Automatically open chat when a stream is opened</label>
                            </li>

                            <li>
                                <h3>Preferred Stream Quality</h3>
                                <p>Quality to (attempt) to use when opening a stream with Streamlink.</p>
                                <p>If the preferred quality is not available, the next lowest option will be used (eventually falling back to 'best').</p>
                                <p><strong>NOTE</strong> that the quality selector only applies to Streamlink players! The Twitch player uses the standard quality selector in the player cog menu.</p>

                                <select onchange={onQualChange}>
                                    {
                                        QUALITY_OPTIONS.map(q => (
                                            <option
                                                selected={q === state.prefs['preferred-stream-quality']}
                                                value={q}
                                            >
                                                {q}
                                            </option>
                                        ))
                                    }
                                </select>
                            </li>

                            <li>
                                <h3>Stream Viewer</h3>
                                <p>View the stream using Streamlink, or using the Twitch popout player inside a Twitchi window.</p>
                                <select onchange={onChangeStreamViewer}>
                                    {
                                        Object.keys(STREAM_VIEWER_OPTIONS).map((v, i) => (
                                            <option
                                                selected={i === state.prefs['stream-viewer']}
                                                value={v}
                                            >
                                                {v}
                                            </option>
                                        ))
                                    }
                                </select>
                            </li>

                            <li>
                                <h3>Streamlink Path</h3>
                                <p>Path to Streamlink executable.</p>
                                <p>Defaults to Streamlink in system PATH. Click the 'choose' button to customize.</p>
                                <input type='text' disabled
                                       value={state.prefs['streamlink-exe-path'] || '[ No path configured ]'}/>
                                <button onclick={actions.chooseStreamlinkExePath}>Choose a new path...</button>
                            </li>
                        </ul>
                    </div>

                    <h2>Stream List</h2>
                    <div className='pageSection'>
                        <ul>
                            <li>
                                <h3>Auto-refresh</h3>
                                <input
                                    type='checkbox'
                                    id='autoRefreshCheckbox'
                                    checked={state.prefs['auto-refresh-follow-list-enabled']}
                                    onchange={state.prefs['auto-refresh-follow-list-enabled'] ? actions.disableFollowListAutoRefresh : actions.enableFollowListAutoRefresh}
                                />
                                <label htmlFor='autoRefreshCheckbox'>Automatically refresh the follow list</label>
                            </li>

                            <li>
                                <h3>Auto-refresh duration</h3>
                                <p>Time in minutes before the list should auto-refresh. Minimum value is 3.</p>
                                <input
                                    type='number'
                                    min='3'
                                    onchange={onChangeAutoRefreshDuration}
                                    value={state.prefs['auto-refresh-follow-list-intvl-minutes']}
                                    placeholder='Auto-refresh timer (minutes)'
                                />
                            </li>
                        </ul>
                    </div>

                    <h2>Account <span
                        style={{color: '#555'}}>| {state.currentUser.display_name || 'not signed in'}</span></h2>
                    <div className='pageSection'>
                        <ul>
                            <li>
                                <h3>Change Account</h3>
                                <p>Sign into a different Twitch account</p>
                                <button onclick={actions.refreshToken}>Change Account</button>
                            </li>

                            <li>
                                <h3>Sign Out</h3>
                                <p>Sign out of the current Twitch account</p>
                                <button onclick={actions.revokeToken}>Log Out</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    )
}
