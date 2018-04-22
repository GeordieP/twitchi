import { h } from 'hyperapp'

export const stateSlice = {
    
}

export const actionsSlice = {
    
}

export default (state, actions) => {
    return (
        <div id='modalContainer'>
            <div id='modal'>
                <div id='modalHeader'>
                    <h1>modal title</h1>
                    <div id='modalCloseBtn'></div>
                </div>
                <div id='modalContent'>
                    <p>modal</p>
                    <p>content</p>
                </div>
            </div>
        </div>
    )
}
