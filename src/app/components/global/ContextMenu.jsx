import { h } from 'hyperapp'

export const stateSlice = {
    items: [],
    position: { x: 0, y: 0 },
    visible: false
}

// actions slice
export const actionsSlice = {
    show: ({ event, items }) => ({
        items,
        position: { x: event.clientX, y: event.clientY },
        visible: true
    }),

    hide: () => ({
        visible: false
    })
}

// List component
// render each given item, and bind each item's onclick to its passed handler function
const MenuList = ({ position, items, hide }) => {
    // when an item is clicked, call its handler and hide the menu
    const click = item => {
        item.handler()
        hide()
    }

    return (
        <ul className='ctxMenuList' style={{ left: `${position.x}px`, top: `${position.y}px` }}>
            {
                items.map(i => (
                    <li onclick={click.bind(null, i)}>
                        {i.label}
                    </li>
                ))
            }
        </ul>
    )
}

// Component to render the list itself, as well as the background element that covers the entire
// page and provides the onclick target for hiding the menu.
export default () => ({ contextMenu: state }, { contextMenu: actions }) => (
    state.visible && (
        <div>
            <MenuList
                {...state}
                hide={actions.hide} />
            <div
              className='ctxMenuWrapper'
              onclick={actions.hide}
              oncontextmenu={actions.hide}
              >
            </div>
        </div>
    )
)
