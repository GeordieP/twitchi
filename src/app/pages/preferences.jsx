import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'

export default (state, actions) => (
    <main>
        <nav>
            <Link className='btn' to='/'>🄷</Link>
        </nav>
        <section className='content'>
            <div>
                <h1>Preferences</h1>
                <p>Prefs: { JSON.stringify(state.prefs) }</p>
            </div>
        </section>
    </main>
)
