import { h } from 'hyperapp'
import { logsSubscribe, logsUnsubscribe } from 'actions/ipcActions'

import NavBar from 'components/NavBar'
import LogView from 'components/LogView'

export default (state, actions) => {
    // on component mount, ask core for all logs
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
