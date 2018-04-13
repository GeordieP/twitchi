import { h } from 'hyperapp'

// scroll to bottom of textarea
const scrollLock = el => {
    el.scrollTop = el.scrollHeight
}

export default ({ channelName, logs, showCloseButton, onCloseClick }) => (
    <div className='logView'>
        <h3>
        { channelName }
        {
            showCloseButton ? (
                <button className='closeStreamBtn' onclick={onCloseClick}>Close Stream</button>
            ) : (
                <button className='cleanupScheduled' disabled>Cleanup scheduled</button>
            )
        }
        </h3>
        <textarea
            readonly
            oncreate={scrollLock}
            onupdate={scrollLock}>
            { logs }
        </textarea>
    </div>
)
