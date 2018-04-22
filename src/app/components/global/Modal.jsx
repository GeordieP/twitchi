import { h } from 'hyperapp'
import { stopProp } from 'util/helpers'

export const stateSlice = {
    header: null,
    content: null,
    visible: false
}

export const actionsSlice = {
    show: ({ header, content }) => ({ header, content, visible: true }),
    hide: () => ({ header: null, content: null, visible: false })
}

export default () => ({ modal: state }, { modal: actions }) => {
    return state.visible && (
        <div id='modalContainer' onclick={actions.hide}>
            <div id='modal' onclick={ stopProp }>
                <div id='modalHeader'>
                    { state.header }
                    <div id='modalCloseBtn' onclick={actions.hide}></div>
                </div>
                <div id='modalContent'>
                    { state.content }
                </div>
            </div>
        </div>
    )
}
