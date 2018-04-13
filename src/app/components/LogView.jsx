import { h } from 'hyperapp'

// scroll to bottom of textarea
const scrollLock = el => {
    el.scrollTop = el.scrollHeight
}

export default ({ channelName, logs, onCloseClick }) => (
    <div className='logView'>
      <h3>{ channelName } <button onclick={onCloseClick}>Close Stream</button></h3>
      <textarea readonly onupdate={scrollLock}>{ logs }</textarea>
    </div>
)
