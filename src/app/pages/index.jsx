import { h } from 'hyperapp'

import NavBar from 'components/NavBar'
import Stream from 'components/Stream'

// split the full streams array into several arrays, each to be shown in a
// separate section on the streams list page.
const divideStreams = (allStreams, favStreamNames) => {
    let favStreams = []
    let regularStreams = []

    // return early with empty arrays if there's nothing to sort
    if (allStreams.length === 0) {
        return {
            favStreams,
            regularStreams
        }
    }

    for (let i = 0; i < allStreams.length; i++) {
        if (favStreamNames.includes(allStreams[i].channel.name)) {
            favStreams.push(allStreams[i])
        } else {
            regularStreams.push(allStreams[i])
        }
    }

    return {
        favStreams,
        regularStreams
    }
}

export default ({ contextMenu }) => (state, actions) => {
    // divide streams array into multiple so we can display each individually
    const { favStreams, regularStreams } = divideStreams(state.streams, state.prefs['favorite-streams'])

    // favorite streams section
    const renderFavStreams = () => favStreams.length > 0 && (
        <span>
            <h2>Favorites</h2>
            <div className='streamsView favorites'>
            {
                favStreams.map(stream => (
                    <Stream
                        key={ 'stream_'+stream }
                        stream={ stream }
                        isFav={ true }
                        openStream={ actions.openStream }
                        openInBrowser={ actions.openURLInBrowser }
                        toggleFav={ actions.toggleStreamFavorite }
                        showContextMenu={ actions.contextMenu.show } />
                ))
            }
            </div>
        </span>
    )

    // everyone else
    const renderRegStreams = () => (
        <span>
            <h2>Followed Channels</h2>
            <div className='streamsView'>
                {
                    regularStreams.map(stream => (
                        <Stream
                            key={ 'stream_'+stream }
                            stream={ stream }
                            isFav={ false }
                            openStream={ actions.openStream }
                            openInBrowser={ actions.openURLInBrowser }
                            toggleFav={ actions.toggleStreamFavorite }
                            showContextMenu={ actions.contextMenu.show } />
                    ))
                }
            </div>
        </span>
    )
    
    return (
        <main>
            {/* render children passed through props - used for rendering context menu component */}
            {/* contextMenu component handles its own show/hide status */}
            { contextMenu }

            <NavBar>
                <a href='#' title='Refresh List' onclick={ actions.refreshFollowList }>
                    <i className='fas fa-sync-alt'></i> 
                </a>
            </NavBar>

            {state.streams.length > 0 ? (
                    <section className='content' id='streamsWrap'>
                        <div id='streamsInnerWrap'>
                            { renderFavStreams() }
                            { renderRegStreams() }
                        </div>
                    </section>
                ) : (
                    <section className='content' id='streamsWrap'>
                        <div id='noLive'>
                            <p>No followed channels are currently live.</p>
                        </div>
                    </section>
                )
            }
        </main>
    )
}
