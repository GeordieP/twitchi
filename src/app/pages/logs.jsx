import { h } from 'hyperapp'
import { QUALITY_OPTIONS } from 'util/constants'

import NavBar from 'components/NavBar'

const onCreated = element => {}
const onDestroyed = element => {}

export default (state, actions) => {
    return (
        <main>
            <NavBar />
            <section
              className='content'
              oncreate={onCreated}
              ondestroy={onDestroyed}
              key='logsContent'>
            <h1>Logs</h1>
            </section>
        </main>
    )
}
