import { h } from 'hyperapp'
import { QUALITY_OPTIONS } from 'util/constants'

const QualityModal = ({
    channelName, channelURL, preferredQuality, openStream, closeModal
}) => {
    let quality = preferredQuality
    const onchange = e => quality = e.target.value

    const onOpen = () => {
        openStream({
            channelName,
            channelURL,
            quality
        })
        closeModal()
    }

    return (
        <div className='vflex'>
            <select id='qualityModalSelect' onchange={ onchange }>
                {
                    QUALITY_OPTIONS.map(q => (
                        <option
                            selected={ q === preferredQuality }
                            value={ q }>
                            { q }
                        </option>
                    ))
                }
            </select>
            <button onclick={ onOpen }>Open { channelName }</button>
        </div>
    )
}

export default ({
    stream, isFav, isOpen, openStream,
    closeStream, openInBrowser, toggleFav,
    unfollowChannel, showContextMenu,
    showModal, closeModal, preferredQuality
}) => {
    const channelName = stream.channel.name
    const channelURL = stream.channel.url

    // handlers
    const launchStream = openStream.bind(null, { channelName, channelURL })
    const openGameDirectory = openInBrowser.bind(null, `https://www.twitch.tv/directory/game/${stream.channel.game}`)
    const openChannel = openInBrowser.bind(null, channelURL)

    const menuItems = [
        {
            label: isOpen ? 'Close Stream' : 'Watch stream',
            handler: isOpen ? closeStream.bind(null, channelName) : launchStream
        },
        {
            label: 'Watch stream with quality...',
            handler: showModal.bind(null, {
                header: 'Choose quality',
                content: (
                    <QualityModal
                    channelName={stream.channel.display_name}
                    channelURL={channelURL}
                    preferredQuality={preferredQuality}
                    openStream={ openStream }
                    closeModal={ closeModal }
                    />
                )
            })
        },
        {
            label: isFav ? 'Remove from favorites' : 'Add to favorites',
            handler: toggleFav.bind(null, channelName)
        },
        {
            label: 'Open channel',
            handler: openChannel
        },
        {
            label: 'Open game directory',
            handler: openGameDirectory
        },
        {
            label: 'Unfollow channel',
            handler: unfollowChannel.bind(null, stream.channel._id)
        }
    ]

    const showMenu = event => showContextMenu({ event, items: menuItems })

    return (
        <div className='stream' onclick={ launchStream } oncontextmenu={ showMenu }>
            <img src={ stream.preview.medium } />
            <div className='stream_info'>
                <div className='stream_info_inner'>
                    <div className='stream_channelInfo'>
                        <h1 id={channelName + '_displayName'}>
                            {stream.channel.display_name}
                        </h1>

                        <h3 id={channelName + '_viewers'}>
                            <strong>{ stream.viewers }</strong>
                        </h3>
                    </div>

                    <h2 id={channelName + '_game'}>
                        {stream.game}
                    </h2>

                    <h3 id={channelName + '_title'}>
                        {stream.channel.status}
                    </h3>
                </div>
            </div>
        </div>
    )
}

