import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'
import { QUALITY_OPTIONS } from 'util/constants'

export default (state, actions) => {
    const onQualChange = e => actions.updatePreferredQuality(e.target.value)

    return (
        <main>
            <nav>
            <Link className='btn' to='/' title='Following List'>
                <i className='fas fa-th'></i> 
            </Link>
            </nav>
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
