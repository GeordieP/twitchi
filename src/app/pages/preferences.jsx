import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'

export default (state, actions) => (
    <main id='content'>
        <Link to='/'>Home</Link>
        <h1>Preferences</h1>
        <p>Prefs: { JSON.stringify(state.prefs) }</p>
    </main>
)
