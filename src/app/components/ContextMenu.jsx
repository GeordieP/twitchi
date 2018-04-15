import { h } from 'hyperapp'

// List component
// render each given item, and bind each item's onclick to its passed handler function
const MenuList = ({ x = 0, y = 0, items, hide }) => {
    // when an item is clicked, call its handler and hide the menu
    const click = item => {
        item.handler()
        hide()
    }

    return (
        <ul className='ctxMenuList' style={{ left: `${x}px`, top: `${y}px` }}>
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
const ContextMenu = () => ({ contextMenu: state }, { contextMenu: actions }) => (
    state.visible && (
        <div>
            <MenuList
                x={state.position.x}
                y={state.position.y}
                items={state.items}
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

// higher-order component to add context menu support to a page or component.
// passed page/component (arg C) must be a lazy component that accepts a 'contextMenu' prop:
//
// fn({ contextMenu }) => fn(state, actions) => h()
//
// page/component C must then return ContextMenu somewhere in its structure (location shouldn't matter,
// ContextMenu is an absolutely-positioned element and should render correctly no matter where
// it's mounted in the DOM.)
export const WithContextMenu = C => (
    <C contextMenu={ ContextMenu } />
)
