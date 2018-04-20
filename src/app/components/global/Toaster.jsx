import { h } from 'hyperapp'
import { Enter, Exit, Move } from '@hyperapp/transitions'

export const stateSlice = {
    toasts: []
}

export const actionsSlice = {
    showToast: newToast => (state, actions) => {
        const toasts = state.toasts.slice()

        // give this toast an ID and a close action timeout function
        newToast.id = Date.now()
        newToast.timeout = setTimeout(actions.hideToast.bind(null, newToast.id), 7000)

        // newToast should be of shape { title, type, body }, where types are:
        // title: String
        // type: Toaster.ToastTypes
        // body: String
        toasts.push(newToast)
        return { toasts }
    },

    hideToast: id => state => {
        const toasts = state.toasts.slice()

        // for speed
        for (let i = 0; i < toasts.length; i++) {
            if (toasts[i].id !== id) continue

            clearTimeout(toasts[i].timeout)

            toasts.splice(i, 1)
            break
        }

        return { toasts }
    }
}

// value of each type also represents a css class
// see styles/components/toaster.styl for details
export const ToastTypes = Object.freeze({
    INFO: 'TOAST_INFO',
    SUCCESS: 'TOAST_SUCCESS',
    WARNING: 'TOAST_WARNING',
    ERROR: 'TOAST_ERROR'
})

const Toast = ({ id, title, type, body, close }) => (
    <Move easing='ease-out'>
        <Enter css={{ transform: 'translate(0, 25vh)' }}>
            <div key={ id } className={'toast ' + type} onclick={ close }>
                <h1>{ title }</h1>
                <p>{ body }</p>
            </div>
        </Enter>
    </Move>
)

export default () => ({ toaster: state }, { toaster: actions }) => (
    state.toasts.length > 0 && (
        <div className='toaster'>
            {
                state.toasts.map(t => (
                    <Toast
                        {...t}
                        close={ actions.hideToast.bind(null, t.id) }
                    />
                ))
            }
        </div>
    )
)
