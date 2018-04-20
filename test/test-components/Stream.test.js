import { h } from 'hyperapp'
import ElFinder from 'testUtil/ElFinder'

import actions from 'actions/actions'
import state_base from 'state/state'
import mocks from 'testUtil/mocks'

import Stream from 'components/Stream'

export default describe('Stream Component', () => {
    it('Renders stream info text', () => {
        const testStream = mocks.store.streams.one_item[0]
        const streamName = testStream.channel.name
        const el_streamRoot = Stream({
            // grab one stream item from mocks
            stream: testStream,
            isFav: false,
            openStream: mocks.actions.NOOP,
            openInBrowser: mocks.actions.NOOP,
            toggleFav: mocks.actions.NOOP,
            showContextMenu: mocks.actions.NOOP,
        })

        // ELEMENTS
        
        // most of the elements we care about are inside stream_info_inner, so keep a reference to that
        const el_streamInfoInner = ElFinder(el_streamRoot)
              .firstChild.byClass('stream_info')
              .firstChild.byClass('stream_info_inner')

        const el_name = el_streamInfoInner
              .firstChild.byClass('stream_channelInfo')
              .firstChild.byId(`${streamName}_displayName`)

        const el_viewers = el_streamInfoInner
              .firstChild.byClass('stream_channelInfo')
              .firstChild.byId(`${streamName}_viewers`)
              .firstChild.byType('strong')

        const el_game = el_streamInfoInner
              .firstChild.byId(`${streamName}_game`)
        
        const el_title = el_streamInfoInner
              .firstChild.byId(`${streamName}_title`)

        // VERIFICATION

        expect(el_name.firstChild.raw())
            .toEqual(testStream.channel.display_name)

        expect(el_viewers.firstChild.raw())
            .toEqual(testStream.viewers)

        expect(el_game.firstChild.raw())
            .toEqual(testStream.game)

        expect(el_title.firstChild.raw())
            .toEqual(testStream.channel.status)
    })

    it('Passes channel name and URL when clicked', () => {
        const mockClickHandler = jest.fn()
        const testStream = mocks.store.streams.one_item[0]
        const view = Stream({
            // grab one stream item from mocks
            stream: testStream,
            isFav: false,
            openStream: mockClickHandler,
            openInBrowser: mocks.actions.NOOP,
            toggleFav: mocks.actions.NOOP,
            showContextMenu: mocks.actions.NOOP,
        })

        // simulate click event
        view.attributes.onclick()

        // expected props were passed as args
        expect(mockClickHandler.mock.calls)
            .toEqual([
                [{ channelName: testStream.channel.name, channelURL: testStream.channel.url }]
            ])

        // test a second click
        view.attributes.onclick()

        // expected props were passed as args for both calls
        expect(mockClickHandler.mock.calls)
            .toEqual([
                [{ channelName: testStream.channel.name, channelURL: testStream.channel.url }],
                [{ channelName: testStream.channel.name, channelURL: testStream.channel.url }]
            ])
    })
})
