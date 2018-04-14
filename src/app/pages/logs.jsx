import { h } from 'hyperapp'
import { logsSubscribe, logsUnsubscribe } from 'actions/ipcActions'

import NavBar from 'components/NavBar'
import LogView from 'components/LogView'

export default () => (state, actions) => {
    return (
        <main>
            <NavBar />

            <section
              className='content'
              oncreate={() => {
                  actions.getOpenStreams()
                  actions.logs.getAllLogs()
                  logsSubscribe()
              }}
              ondestroy={logsUnsubscribe}
              key='logsContent'>
            <h1>Logs</h1>
            {
                Object.keys(state.logs.logLines).map(name => (
                    <LogView
                      channelName={name}
                      logs={state.logs.logLines[name]}
                      showCloseButton={state.openStreams.includes(name)}
                      onCloseClick={actions.closeStream.bind(null, name)}
                      />
                ))
            }
            </section>
        </main>
    )
}
