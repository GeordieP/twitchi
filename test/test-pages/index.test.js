import { h } from 'hyperapp'
import ElFinder from 'testUtil/ElFinder'

import actions from 'actions/actions'
import state_base from 'state/state'
import mocks from 'testUtil/mocks'

import index from 'pages/index'

describe('Index page', () => {
    describe('Stream list', () => {
        it('displays a message when live list is empty', () => {
            // build a state object that has an empty stream list
            const state = Object.assign({}, state_base, {
                streams: mocks.store.streams.empty
            })

            const el_noLiveContainer = ElFinder(index(state, actions))
                .firstChild.byId('streamsWrap')
                .firstChild.byId('noLive')

            // streams container shold contain 1 child element
            expect(el_noLiveContainer.children.length)
                .toEqual(1)

            // it should be the expected tag
            expect(el_noLiveContainer
                   .firstChild.raw()
                   .nodeName)
                .toEqual('p')

            // it should contain the expected string
            // expect(noLiveContainer.children[0].children[0])
            expect(el_noLiveContainer
                   .firstChild.byType('p')
                   .firstChild.raw())
                .toEqual('No followed channels are currently live.')
        })

        it('renders 1 Stream component when 1 stream is live', () => {
            // build a state object that has 1 item in its streams list
            const state = Object.assign({}, state_base, {
                streams: mocks.store.streams.one_item
            })

            const el_streamsContainer = ElFinder(index(state, actions))
                .firstChild.byId('streamsWrap')
                .firstChild.byId('streams')

            expect(el_streamsContainer.children.length)
                .toEqual(1)
        })

        it('renders 2 Stream components when 2 streams are live', () => {
            // build a state object that has 2 items in its streams list
            const state = Object.assign({}, state_base, {
                streams: mocks.store.streams.two_items
            })

            const el_streamsContainer = ElFinder(index(state, actions))
                .firstChild.byId('streamsWrap')
                .firstChild.byId('streams')

            expect(el_streamsContainer.children.length)
                .toEqual(2)
        })
    })
})
