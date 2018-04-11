import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'

const qualityOptions = [
    "best",
    "1080p60",
    "900p60",
    "720p60",
    "720p",
    "480p",
    "360p",
    "160p",
    "worst",
    "audio_only"
]

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
                            qualityOptions.map(q => (
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
