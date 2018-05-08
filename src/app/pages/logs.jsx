import { h } from 'hyperapp'
import { logsSubscribe, logsUnsubscribe } from 'actions/ipcActions'

import NavBar from 'components/NavBar'
import LogView from 'components/LogView'

export default () => (state, actions) => {
    const renderLogs = () => {
        const logNames = Object.keys(state.logs.logLines)

        if (logNames.length === 0) {
            return <p>No logs.</p>
        }

        return logNames.map(name => (
            <LogView
                channelName={name}
                logs={state.logs.logLines[name]}
                showCloseButton={state.openStreams.includes(name)}
                onCloseClick={actions.closeStream.bind(null, name)}
            />
        ))
    }
    return (
        <main>
            <NavBar path={state.location.pathname} />

            <section
                key='logsContent'
                className='content'
                ondestroy={logsUnsubscribe}
                oncreate={() => {
                    actions.getOpenStreams()
                    actions.logs.getAllLogs()
                    logsSubscribe()
                }}
              >
              <div className='page'>
                <h1 style={{ marginBottom: '10px' }}>Logs</h1>
                <h3 style={{ marginBottom: '30px' }}>Log messages from each opened Streamlink process.</h3>
                { renderLogs() }
              </div>
            </section>
        </main>
    )
}
