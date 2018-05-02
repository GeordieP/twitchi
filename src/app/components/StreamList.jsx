import { h } from 'hyperapp'
import { Enter } from '@hyperapp/transitions'
import { QUALITY_OPTIONS } from 'util/constants'

// components
import Stream from 'components/Stream'

const QualityModal = ({ channelName, channelURL, preferredQuality, openStream, closeModal }) => {
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
            <button onclick={ onOpen }>Watch { channelName }</button>
        </div>
    )
}

export default ({ streams }) => (state, actions) => {
    const createStreamrClickMenu = (stream, isFav, isOpen) => {
        const openStream = actions.openStream.bind(null, { channelName: stream.channel.name, channelURL: stream.channel.url })
        const closeStream = actions.closeStream.bind(null, stream.channel.name)

        return [
            {
                label: isOpen ? 'Close Stream' : 'Watch Stream',
                handler: isOpen ? closeStream : openStream
            },

            {
                label: 'Watch stream with quality...',
                handler: actions.modal.show.bind(null, {
                    header: 'Choose Quality',
                    content: (
                        <QualityModal
                            channelName={ stream.channel.display_name }
                            channelURL={ stream.channel.url }
                            preferredQuality={ state.prefs['preferred-stream-quality'] }
                            // must pass actions.openStream here; can't add quality arg to bound function object,
                            // and it can't be applied as a separate arg due to hyperapp's action function signature.
                            openStream={ actions.openStream }
                            closeModal={ actions.modal.hide }
                        />
                    )
                })
            },

            {
                label: isFav ? 'Remove from favorites' : 'Add to favorites',
                handler: actions.toggleStreamFavorite.bind(null, stream.channel.name)
            },

            {
                label: 'View channel page',
                handler: actions.openURLInBrowser.bind(null, stream.channel.url)
            },

            {
                label: 'View game directory',
                handler: actions.openURLInBrowser.bind(null, `https://www.twitch.tv/directory/game/${stream.channel.game}`)
            },

            {
                label: 'Unfollow channel',
                handler: actions.unfollowChannel.bind(
                    null,
                    {
                        channelID: stream.channel._id,
                        displayName: stream.channel.display_name
                    }
                )
            }
        ]
    }

    return (
        <div className='streamsView'>
            {
                streams.map((stream, index) => {
                    const isFav = state.prefs['favorite-streams'].includes(stream.channel.name)
                    const isOpen = state.openStreams.includes(stream.channel.name)

                    const onClick = actions.openStream.bind(null, { channelName: stream.channel.name, channelURL: stream.channel.url })

                    const onRClick = event => {
                        actions.contextMenu.show({
                            event,
                            items: createStreamrClickMenu(stream, isFav, isOpen)
                        })
                    }

                    return (
                        <Enter easing='ease-out' css ={{ opacity: '0' }} time={ 180 } delay={ 50 + (15 * index) }>
                            <Stream
                                stream={ stream }
                                isFav={ isFav }
                                isOpen={ isOpen }
                                onClick={ onClick }
                                onRClick={ onRClick }
                            />
                        </Enter>
                    )
                })
            }
        </div>
    )
}
