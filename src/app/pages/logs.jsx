import { h } from 'hyperapp'
import { QUALITY_OPTIONS } from 'util/constants'
import { logsSubscribe, logsUnsubscribe } from 'actions/ipcActions'

import NavBar from 'components/NavBar'

const LogView = ({ channelName, logs }) => (
    <div style={{ width: '100%', height: '100%' }}>
      <p>{ channelName }</p>
      <textarea style={{ width: '100%', height: '100%' }}>
        { logs }
      </textarea>
    </div>
)

export default (state, actions) => {
    actions.logs.getAllLogs()
    
    return (
        <main>
            <NavBar />
            <section
              className='content'
              oncreate={logsSubscribe}
              ondestroy={logsUnsubscribe}
              key='logsContent'>
            <h1>Logs</h1>
            {
                Object.keys(state.logs.logLines).map(name => (
                    <LogView channelName={name} logs={state.logs.logLines[name]} />
                ))
            }
            </section>
        </main>
    )
}
