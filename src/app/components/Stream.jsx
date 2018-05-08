import { h } from 'hyperapp'

export default ({ enterDelay, stream, isFav, isOpen, onClick, onRClick, toggleFav }) => {
    const channelName = stream.channel.name

    const clickFavBtn = e => {
        e.stopPropagation()
        toggleFav()
    }

    const clickMenuBtn = e => {
        e.stopPropagation()
        onRClick(e)
    }

    return (
        <div className='stream' onclick={ onClick } oncontextmenu={ onRClick }>
            <div className="stream_controls">
                { isFav
                    ? <i className="fas fa-star" onclick={ clickFavBtn } title="Unfavorite" />
                    : <i className="far fa-star" onclick={ clickFavBtn } title="Favorite" />
                }

                <i className="fas fa-ellipsis-v" onclick={ clickMenuBtn } title="Menu" />
            </div>
            <div className='stream_info'>
                <div className='stream_info_inner'>
                    <div className='stream_channelInfo'>
                        <h1 id={channelName + '_displayName'}>
                            { isOpen
                                ? <i className='fas fa-play-circle stream-is-live' />
                                : null
                            }
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
            <img src={ stream.preview.medium } />
        </div>
    )
}

