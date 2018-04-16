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

// HOC around NavBar, create a context menu for the refresh button
const IndexNavbar = ({ refreshingFollowList, prefs, refreshFollowList, showContextMenu, disableFollowListAutoRefresh, enableFollowListAutoRefresh }) => {
    const menuItems = [
        {
            label: 'Refresh now',
            handler: refreshFollowList
        },

        prefs['auto-refresh-follow-list-enabled'] ? {
            label: 'Disable auto-refresh',
            handler: disableFollowListAutoRefresh
        } : {
            label: 'Enable auto-refresh',
            handler: enableFollowListAutoRefresh
        }
    ]

    const showMenu = event => showContextMenu({ event, items: menuItems })

    return (
        <NavBar>
            <a href='#' title='Refresh List' onclick={ refreshFollowList } oncontextmenu={ showMenu }>
                <i className={ 'fas fa-sync-alt ' + (refreshingFollowList ? 'refreshAnim' : '') }></i> 
            </a>
        </NavBar>
    )
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
        <div>
            {/* render children passed through props - used for rendering context menu component */}
            {/* contextMenu component handles its own show/hide status */}
            { contextMenu }

            <main>
              <IndexNavbar
                refreshingFollowList={state.refreshingFollowList}
                prefs={state.prefs}
                refreshFollowList={actions.refreshFollowList}
                showContextMenu={actions.contextMenu.show}
                disableFollowListAutoRefresh={actions.disableFollowListAutoRefresh}
                enableFollowListAutoRefresh={actions.enableFollowListAutoRefresh}
                />

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
        </div>
    )
}
