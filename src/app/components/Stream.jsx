import { h } from 'hyperapp'

export default ({
    stream,
    isFav,
    isOpen,
    openStream,
    closeStream,
    openInBrowser,
    toggleFav,
    showContextMenu }) => {
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
            label: 'Open channel',
            handler: openChannel
        },
        {
            label: 'Open game directory',
            handler: openGameDirectory
        },
        {
            label: isFav ? 'Remove from favorites' : 'Add to favorites',
            handler: toggleFav.bind(null, channelName)
        },
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

