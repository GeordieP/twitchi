import { h } from 'hyperapp'

export default ({ stream, openStream }) => {
    const onclick = () => {
        openStream({
            channelName: stream.channel.name,
            channelURL: stream.channel.url
        })
    }

    return (
        <div className='stream' onclick={ onclick }>
            <h2 className='stream_channelName'>{ stream.channel.name }</h2>
            <h4 className='stream_viewers'>{ stream.viewers }</h4>
            <h3 className='stream_title'>{ stream.channel.status }</h3>
            <h4 className='stream_game'>{ stream.game }</h4>
        </div>
    )
}

