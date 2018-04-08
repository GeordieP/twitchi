import { h } from 'hyperapp'

export default ({ stream, openStream }) => {
    const channelName = stream.channel.name
    const channelURL = stream.channel.url
    openStream = openStream.bind(null, { channelName, channelURL })

    return (
        <div className='stream' onclick={ openStream }>
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

