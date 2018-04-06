import actions from 'actions/actions'
import state_base from 'state/state'
import mocks from './mocks'

// components
import c_Main from 'pages/index'
import c_Stream from 'components/Stream'

describe('Index page', () => {
    describe('Stream list', () => {
        // helper function: locate element: Main > div#streams
        const getStreamsContainer = view =>
              view.children.find(el => el.nodeName === 'div' && el.attributes.id === 'streams')

        it('displays a message when live list is empty', () => {
            // build a state object that has an empty stream list
            const state = Object.assign({}, state_base, {
                streams: mocks.store.streams.empty
            })

            const view = c_Main(state, actions)
            const streamsContainer = getStreamsContainer(view)

            // streams container shold contain 1 child element
            expect(streamsContainer.children.length)
                .toEqual(1)

            // it should be the expected tag
            expect(streamsContainer.children[0].nodeName)
                .toEqual('p')

            // it should contain the expected string
            expect(streamsContainer.children[0].children[0])
                .toEqual('No followed channels are currently live')
        })

        it('renders 1 Stream component when 1 stream is live', () => {
            // build a state object that has 1 item in its streams list
            const state = Object.assign({}, state_base, {
                streams: mocks.store.streams.one_item
            })

            const view = c_Main(state, actions)
            const streamsContainer = getStreamsContainer(view)

            expect(streamsContainer.children.length)
                .toEqual(1)
        })

        it('renders 2 Stream components when 2 streams are live', () => {
            // build a state object that has 2 items in its streams list
            const state = Object.assign({}, state_base, {
                streams: mocks.store.streams.two_items
            })

            const view = c_Main(state, actions)
            const streamsContainer = getStreamsContainer(view)

            expect(streamsContainer.children.length)
                .toEqual(2)
        })
    })
})

describe('Stream Component', () => {
    it('Renders stream info text', () => {
        const props = {
            // grab one stream item from mocks
            stream: mocks.store.streams.one_item[0],
            openStream: mocks.actions.NOOP
        }

        const view = c_Stream(props)
        const { children } = view

        //
        // NAME
        const el_name = children.find(el => el.attributes.className === 'stream_channelName')
        // exists
        expect(el_name)
            .toBeDefined()
        // contains expected text
        expect(el_name.children[0])
            .toEqual(props.stream.channel.name)

        //
        // VIEWERS
        const el_viewers = children.find(el => el.attributes.className === 'stream_viewers')
        // exists
        expect(el_viewers)
            .toBeDefined()
        // contains expected text
        expect(el_viewers.children[0])
            .toEqual(props.stream.viewers)

        //
        // TITLE
        const el_title = children.find(el => el.attributes.className === 'stream_title')
        // exists
        expect(el_title)
            .toBeDefined()
        // contains expected text
        expect(el_title.children[0])
            .toEqual(props.stream.channel.status)

        //
        // GAME
        const game = children.find(el => el.attributes.className === 'stream_game')
        // exists
        expect(game)
            .toBeDefined()
        // contains expected text
        expect(game.children[0])
            .toEqual(props.stream.game)
    })

    it('Passes channel name and URL when clicked', () => {
        const mockClickHandler = jest.fn()
        const props = {
            // grab one stream item from mocks
            stream: mocks.store.streams.one_item[0],
            openStream: mockClickHandler
        }

        const view = c_Stream(props)

        // simulate click event
        view.attributes.onclick()

        // expected props were passed as args
        expect(mockClickHandler.mock.calls)
            .toEqual([
                [{ channelName: props.stream.channel.name, channelURL: props.stream.channel.url }]
            ])

        // test a second click
        view.attributes.onclick()

        // expected props were passed as args for both calls
        expect(mockClickHandler.mock.calls)
            .toEqual([
                [{ channelName: props.stream.channel.name, channelURL: props.stream.channel.url }],
                [{ channelName: props.stream.channel.name, channelURL: props.stream.channel.url }]
            ])
    })
})

describe.skip('Preferences page', () => { })
