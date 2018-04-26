import { h } from 'hyperapp'

export default ({ enterDelay, stream, isFav, isOpen, onClick, onRClick }) => {
    const channelName = stream.channel.name
    const channelURL = stream.channel.url

    return (
        <div className='stream' onclick={ onClick } oncontextmenu={ onRClick }>
            <img src={ stream.preview.medium } />
            <div className='stream_info'>
                <div className='stream_info_inner'>
                    <div className='stream_channelInfo'>
                        <h1 id={channelName + '_displayName'}>
                            { isOpen ? (<i className='fas fa-play-circle stream-is-live'></i>) : null }
                            { stream.channel.display_name }
                        </h1>

                        <h3 id={ channelName+'_viewers' }>
                            <strong>{ stream.viewers }</strong>
                        </h3>
                    </div>

                    <h2 id={ channelName+'_game' }>
                        { stream.game }
                    </h2>

                    <h3 id={ channelName + '_title' }>
                        { stream.channel.status }
                    </h3>
                </div>
            </div>
        </div>
    )
}

