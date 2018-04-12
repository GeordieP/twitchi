import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'
import { QUALITY_OPTIONS } from 'util/constants'

export default (state, actions) => {
    const onOpenClick = () => {
        const channelName = document.getElementById('openStream_username').value
        const quality = document.getElementById('openStream_quality').value
        const channelURL = `twitch.tv/${channelName}`
        actions.openStream({ channelName, channelURL, quality })
    }
    
    return (
        <main>
            <nav>
                <Link className='btn' to='/' title='Following List'>
                    <i className='fas fa-th'></i> 
                </Link>
                <Link className='btn' to='/preferences' title='Preferences'>
                    <i className='fas fa-cog'></i> 
                </Link>
            </nav>
            <section className='content'>
                <h1>Launch Stream</h1>
                <h2>Open any stream by providing their username.</h2>
                <div>
                    <h3>Username</h3>
                    <input type='text' id='openStream_username' placeholder='username' />

                    <h3>Stream Quality Preference</h3>
                    <p>Applies to this stream only. Does not affect the global quality setting on the options page.</p>
                    <select id='openStream_quality'>
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

                    <button onclick={ onOpenClick }>Open</button>
                </div>
            </section>
        </main>
    )
}
