import { h } from 'hyperapp'
import { QUALITY_OPTIONS } from 'util/constants'

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

    return (
        <main>
            <NavBar />

            <section className='content'>
                <div className='page'>
                    <h1 style={{ marginBottom: '30px' }}>Preferences</h1>

                    <h2>Stream Options</h2>
                    <div className='pageSection'>
                        <ul>
                            <li>
                                <h3>Live Notification</h3>
                                <p>Show a system notification when streams you follow go live.</p>
                                <input
                                    type='checkbox'
                                    id='liveNotifCheckbox'
                                    checked={ state.prefs['live-notification-enabled'] }
                                    onchange={ state.prefs['live-notification-enabled'] ? actions.disableLiveNotif : actions.enableLiveNotif }
                                />
                                <label htmlFor='liveNotifCheckbox'>Enable live notifications</label>
                            </li>

                            <li>
                                <h3>Preferred Stream Quality</h3>
                                <p>Quality to (attempt) to use when opening a stream with Streamlink.</p>
                                <p>If the preferred quality is not available, the next lowest option will be used (eventually falling back to 'best').</p>
                                <select onchange={ onQualChange }>
                                    {
                                        QUALITY_OPTIONS.map(q => (
                                            <option
                                                selected={ q === state.prefs['preferred-stream-quality'] }
                                                value={ q }
                                              >
                                                { q }
                                            </option>
                                        ))
                                    }
                                </select>
                            </li>
                        </ul>
                    </div>

                    <h2>Stream List</h2>
                    <div className='pageSection'>
                        <ul>
                            <li>
                                <h3>Auto-refresh</h3>
                                <p>Enable or disable automatic refreshing of the main following list.</p>
                                <input
                                    type='checkbox'
                                    id='autoRefreshCheckbox'
                                    checked={ state.prefs['auto-refresh-follow-list-enabled'] }
                                    onchange={ state.prefs['auto-refresh-follow-list-enabled'] ? actions.disableFollowListAutoRefresh : actions.enableFollowListAutoRefresh }
                                    />
                                <label htmlFor='autoRefreshCheckbox'>Enable auto-refresh</label>
                            </li>

                            <li>
                                <h3>Auto-refresh duration</h3>
                                <p>Time in minutes before the list should auto-refresh. Minimum value is 3.</p>
                                <input
                                    type='number'
                                    min='3'
                                    onchange={ onChangeAutoRefreshDuration }
                                    value={ state.prefs['auto-refresh-follow-list-intvl-minutes'] }
                                    placeholder='Auto-refresh timer (minutes)'
                                />
                            </li>
                        </ul>
                    </div>

                    <h2>Account</h2>
                    <div className='pageSection'>
                        <ul>
                            <li>
                                <h3>Change Account</h3>
                                <p>Log into a different Twitch account</p>
                                <button onclick={ actions.refreshToken }>Change Account</button>
                            </li>

                            <li>
                                <h3>Log Out</h3>
                                <p>Log out of the current Twitch account</p>
                                <button onclick={ actions.revokeToken }>Log Out</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    )
}
