import { h } from 'hyperapp'

export default ({ channelName, logs, onCloseClick }) => (
    <div className='logView'>
      <h3>{ channelName } <button onclick={onCloseClick}>Close Stream</button></h3>
      <textarea readonly>{ logs }</textarea>
    </div>
)
