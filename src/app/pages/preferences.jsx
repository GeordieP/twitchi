import { h } from 'hyperapp'
import { QUALITY_OPTIONS } from 'util/constants'

import NavBar from 'components/NavBar'

export default (state, actions) => {
    const onQualChange = e => actions.updatePreferredQuality(e.target.value)

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
            </section>
        </main>
    )
}
