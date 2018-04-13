import { h } from 'hyperapp'
import ElFinder from 'testUtil/ElFinder'

import actions from 'actions/actions'
import state_base from 'state/state'
import mocks from 'testUtil/mocks'

import logs from 'pages/logs'

describe('Logs page', () => {
    const state = Object.assign({}, state_base, {
        streams: mocks.store.streams.two_items,
        openStreams: mocks.store.openStreams.one_item,
        logs: {
            logLines: mocks.store.logs.logLines.two_items
        }
    })

    const pg_logs = ElFinder(logs(state, actions))
            .firstChild.byClass('content')

    const logViews = pg_logs
            .allChildren
            .withClass('logView')

    it('displays a LogView component for each stream in state', () => {
        // renders the correct number of logview components
        expect(logViews.length)
            .toEqual(Object.keys(state.logs.logLines).length)
    })

    it('renders a close button for any open streams', () => {
        // filter through all rendered LogView components, build an array of all
        // that have a close stream button
        const logViewsWithCloseBtn = logViews.filter(el => (
             el
                .firstChild.byType('h3')
                .firstChild.byType('button')
                .attributes.className.includes('closeStreamBtn')
        ))

        // expect the correct number of items with close buttons
        expect(logViewsWithCloseBtn.length)
            .toEqual(state.openStreams.length)

        // expect the items with close buttons to correspond to names in the openstreams array
        logViewsWithCloseBtn.forEach(el => {
            const name = el
                  .firstChild.byType('h3')
                  .firstChild.raw()
            expect(state.openStreams.includes(name))
                .toEqual(true)
        })
    })

    it('renders the correct log lines for given stream', () => {
        logViews.forEach(el => {
            const name = el
                  .firstChild.byType('h3')
                  .firstChild.raw()

            const el_textArea = el.firstChild.byType('textarea')
            expect(el_textArea.children)
                .toEqual(state.logs.logLines[name])

        })
    })
})
