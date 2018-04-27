import { h } from 'hyperapp'
import { QUALITY_OPTIONS } from 'util/constants'

import NavBar from 'components/NavBar'

export default () => (state, actions) => {
    const onOpenClick = () => {
        const channelName = document.getElementById('openStream_username').value || ''
        const quality = document.getElementById('openStream_quality').value || ''
        const channelURL = `twitch.tv/${channelName}`
        actions.openStream({ channelName, channelURL, quality })
    }
    
    return (
        <main>
            <NavBar />

            <section className='content'>
                <div className='page'>

                <h1 style={{ marginBottom: '10px' }}>Open a Stream</h1>
                <h3 style={{ marginBottom: '30px' }}>Use Streamlink to watch a stream that's not on your following list.</h3>

                <h2>Setup</h2>
                    <div className='pageSection'>
                        <ul>
                            <li>

                                <h3>Stream Quality</h3>
                                <p>Only applies to this instance. Does not affect global setting in options page.</p>
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

                                <br />
                                <br />

                                <h3>Username</h3>
                                <p>Twitch username of stream to open</p>
                                <input type='text' id='openStream_username' placeholder='Twitch channel name' />
                                <br />
                                <button id='openStream_openBtn' onclick={ onOpenClick }>Watch this stream</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    )
}
