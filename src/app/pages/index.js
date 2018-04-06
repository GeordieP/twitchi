import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'

import Stream from 'components/Stream'

export default (state, actions) => (
    <main>
        <Link to='/preferences'>Preferences</Link>
        <h1>Stream List</h1>
        <button onclick={ actions.getStreamList }>Refresh</button>
        <div id="streams">
            {
                state.streams.length > 0
                ? state.streams.map(stream => <Stream stream={ stream } openStream={ actions.openStream } />)
                : <p>No followed channels are currently live</p>
            }
        </div>
    </main>
)
