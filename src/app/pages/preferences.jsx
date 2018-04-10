import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'

export default (state, actions) => (
    <main>
        <nav>
          <Link className='btn' to='/' title='Following List'>
              <i className='fas fa-th'></i> 
          </Link>
        </nav>
        <section className='content'>
            <div>
                <h1>Preferences</h1>
                <p>Prefs: { JSON.stringify(state.prefs) }</p>

                <button onclick={ actions.refreshToken }>Change Account</button>
            </div>
        </section>
    </main>
)
