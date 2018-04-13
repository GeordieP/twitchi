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
                <button onclick={onCloseClick}>Close Stream</button>
            ) : (
                <button disabled>Cleanup scheduled</button>
            )
        }
      </h3>
      <textarea readonly onupdate={scrollLock}>{ logs }</textarea>
    </div>
)
