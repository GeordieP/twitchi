import { h } from 'hyperapp'

// value of each type also represents a css class
// see styles/components/toaster.styl for details
export const ToastTypes = Object.freeze({
    INFO: 'TOAST_INFO',
    SUCCESS: 'TOAST_SUCCESS',
    WARNING: 'TOAST_WARNING',
    ERROR: 'TOAST_ERROR'
})

const TEMP_defaultToasts = [
    {
        title: 'info toast',
        type: ToastTypes.INFO,
        body: 'content of the toast notification'
    },
    {
        title: 'success toast',
        type: ToastTypes.SUCCESS,
        body: 'content of the toast notification'
    },
    {
        title: 'warning toast',
        type: ToastTypes.WARNING,
        body: 'content of the toast notification'
    },
    {
        title: 'error toast',
        type: ToastTypes.ERROR,
        body: 'content of the toast notification'
    },
]

export const stateSlice = {
    toasts: [ ...TEMP_defaultToasts ]
}

export const actionsSlice = {
    
}

const Toast = ({ title, type, body }) => (
    <div className={'toast ' + type}>
        <h1>{ title }</h1>
        <p>{ body }</p>
    </div>
)

export default () => ({ toaster: state }, { toaster: actions }) => (
    state.toasts.length > 0 && (
        <div className='toaster'>
            { state.toasts.map(t => <Toast {...t} />) }
        </div>
    )
)
