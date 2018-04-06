import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'

export default (state, actions) => (
    <main>
        <Link to='/'>Home</Link>
        <h1>Preferences</h1>
        <p>Prefs: { JSON.stringify(state.prefs) }</p>
    </main>
)
