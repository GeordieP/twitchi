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
                <h1>Preferences</h1>
                <div>
                    <h2>Account</h2>
                    <button onclick={ actions.refreshToken }>Change Account</button>
                    <button onclick={ actions.revokeToken }>Log Out</button>
                </div>

                <div>
                    <h2>Stream Options</h2>
                    <select onchange={ onQualChange }>
                        {
                            QUALITY_OPTIONS.map(q => (
                                <option
                                selected={ q === state.prefs['preferred-stream-quality'] }
                                value={ q }>
                                    { q }
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div>
                    <h2>Stream List</h2>
                    <h3>Auto-refresh</h3>
                    <label htmlFor='autoRefreshCheckbox'>Enable auto-refresh</label>
                    <input
                        type='checkbox'
                        id='autoRefreshCheckbox'
                        checked={ state.prefs['auto-refresh-follow-list-enabled'] }
                        onchange={ state.prefs['auto-refresh-follow-list-enabled'] ? actions.disableFollowListAutoRefresh : actions.enableFollowListAutoRefresh }
                        />

                    <h3>Auto-refresh duration</h3>
                    <p>Time in minutes before the list should auto-refresh</p>
                    <input
                        type='text'
                        onchange={ onChangeAutoRefreshDuration }
                        value={ state.prefs['auto-refresh-follow-list-intvl-minutes'] }
                        placeholder='Auto-refresh timer (minutes)'
                    />
                </div>

                <div>
                    <h2>Notifications</h2>
                    <h3>Live Notification</h3>
                    <label htmlFor='liveNotifCheckbox'>Show a notification when streams go live</label>
                    <input
                        type='checkbox'
                        id='liveNotifCheckbox'
                        checked={ state.prefs['live-notification-enabled'] }
                        onchange={ state.prefs['live-notification-enabled'] ? actions.disableLiveNotif : actions.enableLiveNotif }
                    />
                </div>
            </section>
        </main>
    )
}
