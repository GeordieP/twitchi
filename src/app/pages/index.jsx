import { h } from 'hyperapp'

import NavBar from 'components/NavBar'
import Stream from 'components/Stream'

export default () => (state, actions) => (
    <main>
        <NavBar>
            <a href='#' title='Refresh List' onclick={ actions.refreshFollowList }>
                <i className='fas fa-sync-alt'></i> 
            </a>
        </NavBar>

        <section className='content' id='streamsWrap'>
          {state.streams.length > 0 ? (
              <div id='streams'>
              {
                  state.streams.map(stream => (
                      <Stream
                          stream={ stream }
                          key={ 'stream_'+stream }
                          openStream={ actions.openStream }
                          showContextMenu={ actions.contextMenu.show } />
                  ))
              }
              </div>
          ) : (
          <div id='noLive'>
              <p>No followed channels are currently live.</p>
          </div>
          )}
        </section>
    </main>
)
