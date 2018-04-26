import { h } from 'hyperapp'

import NavBar from 'components/NavBar'
import StreamList from 'components/StreamList'

// split the full streams array into several arrays, each to be shown in a
// separate section on the streams list page.
const divideStreams = (allStreams, favStreamNames, openStreamNames) => {
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
        const currentName = allStreams[i].channel.name

        if (favStreamNames.includes(currentName)) {
            if (openStreamNames.includes(currentName)) {
                favStreams.unshift(allStreams[i])
            } else {
                favStreams.push(allStreams[i])
            }
        } else {
            if (openStreamNames.includes(currentName)) {
                regularStreams.unshift(allStreams[i])
            } else {
                regularStreams.push(allStreams[i])
            }
        }
    }

    return {
        favStreams,
        regularStreams
    }
}

// HOC around NavBar, create a context menu for the refresh button
const IndexNavbar = ({
    refreshingFollowList,
    autoRefreshEnabled,
    refreshFollowList,
    showContextMenu,
    disableFollowListAutoRefresh,
    enableFollowListAutoRefresh}) => {
    const menuItems = [
        {
            label: 'Refresh now',
            handler: refreshFollowList
        },

        autoRefreshEnabled ? {
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
            <a href='#'
                title={
                    'Refresh List ' +
                    (autoRefreshEnabled ? '(Auto refresh is on)' : '(Auto refresh is disabled)')
                }
                className='refreshListBtn'
                onclick={ refreshFollowList }
                oncontextmenu={ showMenu }
                >
                <i className={
                    'fas fa-sync-alt ' +
                    (refreshingFollowList ? 'refreshing ' : '') +
                    (autoRefreshEnabled ? 'autoRefreshEnabled ' : '')
                }></i> 
            </a>
        </NavBar>
    )
}

export default () => (state, actions) => {
    // divide streams array into multiple so we can display each individually
    const { favStreams, regularStreams } = divideStreams(state.streams, state.prefs['favorite-streams'], state.openStreams)

    return (
        <main>
            <IndexNavbar
                refreshingFollowList={state.refreshingFollowList}
                autoRefreshEnabled={state.prefs['auto-refresh-follow-list-enabled']}
                refreshFollowList={actions.refreshFollowList}
                showContextMenu={actions.contextMenu.show}
                disableFollowListAutoRefresh={actions.disableFollowListAutoRefresh}
                enableFollowListAutoRefresh={actions.enableFollowListAutoRefresh}
            />

            {state.streams.length > 0 ? (
                    <section className='content' id='streamsWrap'>
                        <div id='streamsInnerWrap'>
                            {
                                favStreams.length > 0 && (
                                    <span>
                                        <h2>Favorite Channels</h2>,
                                        <StreamList streams={ favStreams } />
                                    </span>
                                )
                            }

                            {
                                regularStreams.length > 0 && (
                                    <span>
                                        <h2>Followed Channels</h2>,
                                        <StreamList streams={ regularStreams } />
                                    </span>
                                )
                            }
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
