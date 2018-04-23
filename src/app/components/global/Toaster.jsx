import { h } from 'hyperapp'
import { Enter, Exit, Move } from '@hyperapp/transitions'

const TOAST_DISMISS_DURATION_SECONDS = 1000 * 7

export const stateSlice = {
    toasts: []
}

export const actionsSlice = {
    showToast: toastData => (state, actions) => {
        // toastData should be of shape { title, type, body }, where types are:
        // title: String
        // type: Toaster.ToastTypes
        // body: String

        const toasts = state.toasts.slice()
        const newToast = new Toast(toastData, actions.hideToast)
        toasts.push(newToast)
        newToast.startTimeout()

        return { toasts }
    },

    stopToastTimeout: id => state => {
        const toasts = state.toasts.slice()
        for (let i = 0; i < toasts.length; i++) {
            if (toasts[i].id !== id) continue
            toasts[i].stopTimeout()
            break
        }
    },

    startToastTimeout: id => state => {
        const toasts = state.toasts.slice()
        for (let i = 0; i < toasts.length; i++) {
            if (toasts[i].id !== id) continue
            toasts[i].startTimeout()
            break
        }
    },

    hideToast: id => state => {
        const toasts = state.toasts.slice()

        // for speed
        for (let i = 0; i < toasts.length; i++) {
            if (toasts[i].id !== id) continue

            toasts[i].stopTimeout()

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

// Toast class.
// takes toastData object, and hide toast action (needs to be wired; should
// be passed from inside an app action).
// we store instances of the Toast function rather than plain objects so we
// can call methods to start and stop the deletion timeout on toast hover
const Toast = function({ title, body, type }, a_hideToast) {
    this.id = Date.now()
    this.title = title
    this.body = body
    this.type = type

    this.timeoutFn = a_hideToast.bind(null, this.id)

    this.startTimeout = () => {
        this.timeout = setTimeout(this.timeoutFn, TOAST_DISMISS_DURATION_SECONDS)     
    }

    this.stopTimeout = () => {
        clearTimeout(this.timeout)
        this.timeout = null
    }
}

const ToastComponent = ({ id, title, type, body, close, mouseover, mouseout }) => (
    <Move easing='ease-out'>
        <Enter css={{ transform: 'translate(0, 25vh)' }}>
            <div key={ id } className={'toast ' + type} onclick={ close } onmouseover={ mouseover } onmouseout={ mouseout }>
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
                    <ToastComponent
                        {...t}
                        close={ actions.hideToast.bind(null, t.id) }
                        mouseover={ actions.stopToastTimeout.bind(null, t.id) }
                        mouseout={ actions.startToastTimeout.bind(null, t.id) }
                    />
                ))
            }
        </div>
    )
)
