import { h } from 'hyperapp'
import { Enter } from '@hyperapp/transitions'
import { QUALITY_OPTIONS } from 'util/constants'

// components
import Stream from 'components/Stream'

const QualityModal = ({ displayName, channelName, preferredQuality, openStream, closeModal }) => {
    let quality = preferredQuality
    const onchange = e => quality = e.target.value

    const onOpen = () => {
        openStream({
            channelName,
            quality
        })
        closeModal()
    }

    return (
        <div className='vflex'>
            <p><strong>NOTE</strong> that the quality selector only applies to Streamlink players!</p>
            <br />
            <p>The Twitch player uses the standard quality selector in the player cog menu.</p>
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
            <button onclick={ onOpen }>Watch { displayName }</button>
        </div>
    )
}

export default ({ streams }) => (state, actions) => {
    const createStreamrClickMenu = (stream, isFav, isOpen, toggleFav) => {
        const openStream = actions.openStream.bind(null, { channelName: stream.channel.name })
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
                            channelName={ stream.channel.name }
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
                label: 'Open Chat',
                handler: actions.openChat.bind(null, stream.channel.name)
            },

            {
                label: 'Open Twitch channel',
                handler: actions.openURLInBrowser.bind(null, stream.channel.url)
            },

            {
                label: 'Open game directory',
                handler: actions.openURLInBrowser.bind(null, `https://www.twitch.tv/directory/game/${stream.channel.game}`)
            },

            {
                label: isFav ? 'Remove from favorites' : 'Add to favorites',
                handler: toggleFav
            },

            // NOTE:
            // Removing the unfollow button for now, as it probably doesn't see much use, and upon
            // adding the "menus dont overflow viewport" fix, sometimes the unfollow button
            // (the last element in the menu) happens to be where the mouse pointer is; this
            // could lead to some unfortunate and frustrating misclicks.
            //
            // {
            //     label: 'Unfollow channel',
            //     handler: actions.unfollowChannel.bind(
            //         null,
            //         {
            //             channelID: stream.channel._id,
            //             displayName: stream.channel.display_name
            //         }
            //     )
            // }
        ]
    }

    return (
        <div className='streamsView'>
            {
                streams.map((stream, index) => {
                    const isFav = state.prefs['favorite-streams'].includes(stream.channel.name)
                    const isOpen = state.openStreams.includes(stream.channel.name)

                    const toggleFav = actions.toggleStreamFavorite.bind(null, stream.channel.name)
                    const onClick = actions.openStream.bind(null, { channelName: stream.channel.name })
                    const onRClick = event => {
                        actions.contextMenu.show({
                            event,
                            items: createStreamrClickMenu(stream, isFav, isOpen, toggleFav)
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
                                toggleFav={ toggleFav }
                            />
                        </Enter>
                    )
                })
            }
        </div>
    )
}
