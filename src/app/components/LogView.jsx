import { h } from 'hyperapp'

export default ({ channelName, logs }) => (
    <div className='logView'>
      <h3>{ channelName }</h3>
      <textarea readonly>{ logs }</textarea>
    </div>
)
