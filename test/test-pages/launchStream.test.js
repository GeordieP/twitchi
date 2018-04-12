import { h } from 'hyperapp'
import ElFinder from 'testUtil/ElFinder'

import actions from 'actions/actions'
import state_base from 'state/state'
import mocks from 'testUtil/mocks'

import LaunchStream from 'pages/launchStream'

describe('Launch Stream Page', () => {
    const state = Object.assign({}, state_base, {
        prefs: mocks.store.prefs.populated
    })

    const pg_launchStream = ElFinder(LaunchStream(state, actions))
    const el_content = pg_launchStream
            .firstChild.byClass('content')

    it('renders username text field', () => {
        const el_inputField = el_content
              .firstChild.byType('div')
              .firstChild.byId('openStream_username')

        // input field should exist
        expect(el_inputField)
            .toBeDefined()

        // verify placeholder text
        expect(el_inputField.attributes.placeholder)
            .toEqual('Username to open')
    })

    it('renders quality drop-down menu', () => {
        const el_qualitySelect = el_content
              .firstChild.byType('div')
              .firstChild.byId('openStream_quality')

        // quality select dropdown should exist
        expect(el_qualitySelect)
            .toBeDefined()

        // quality select dropdown should have several children
        expect(el_qualitySelect.children.length)
            .toBeGreaterThan(3)

        // quality select dropdown should show same value as state preferred-stream-quality
        //
        // find all option elements with 'selected' set to true
        const el_selectDropdown_selectedItems = el_qualitySelect.children.filter(el => (
            el.attributes.selected === true
        ))

        // there should only have been one item with 'selected' set to true
        expect(el_selectDropdown_selectedItems.length)
            .toEqual(1)

        // the single selected item should match the preferred quality
        const preferredQuality = state.prefs['preferred-stream-quality']
        expect(el_selectDropdown_selectedItems[0].children[0])
            .toEqual(preferredQuality)
    })

    it('renders "open" button', () => {
        const el_openBtn = el_content
              .firstChild.byType('div')
              .firstChild.byId('openStream_openBtn')

        // open button should exist
        expect(el_openBtn)
            .toBeDefined()
        
        // onclick handler should be function
        expect(el_openBtn.attributes.onclick)
            .toBeDefined()
    })
})
