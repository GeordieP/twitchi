import { h } from 'hyperapp'

/*
  MENU DIMENSIONS CALCULATION
  Calculate an approximate menu size, so we can ensure none of the menu is
  clipped by viewport edges.

  When the menu would be clipped on a dimension, we just offest the menu by
  its size in that dimension.

  The constants here should ALWAYS reflect the values set in ContextMenu.styl;
  relevant properties are under the .ctxMenuList and .ctxMenuList>li elements.
*/

// based on font size
const MENUITEM_TEXT_USUAL_HEIGHT = 13
// li padding: 10px 5px
const MENUITEM_PADDING_V = 10 * 2
// li margin: 0 3px 5px 0
const MENUITEM_MARGIN_V = 5
// calc height of a normal item
const MENUITEM_APPROX_HEIGHT = MENUITEM_TEXT_USUAL_HEIGHT + MENUITEM_PADDING_V + MENUITEM_MARGIN_V
// .ctxMenuList width: 220px
const MENU_MAX_WIDTH = 220
const calcMenuDimensions = numItems => {
    // vertical space of a menu item * number of items, then subtract margin once (no margin on last element)
    const totalMenuHeight = (MENUITEM_APPROX_HEIGHT * numItems) - MENUITEM_MARGIN_V
    return { w: MENU_MAX_WIDTH, h: totalMenuHeight }
}

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

    // figure out approximate dimensions of this menu
    const menuDimensions = calcMenuDimensions(items.length)

    // ensure menu doesn't flow off right side of screen
    const menuX = (position.x + menuDimensions.w > window.innerWidth)
        ? position.x - menuDimensions.w
        : position.x

    // ensure menu doesn't flow off bottom of screen
    const menuY = (position.y + menuDimensions.h > window.innerHeight)
        ? position.y - menuDimensions.h
        : position.y

    return (
        <ul className='ctxMenuList' style={{ left: `${menuX}px`, top: `${menuY}px` }}>
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
