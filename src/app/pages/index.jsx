import { h } from 'hyperapp'
import { Link } from '@geordiep/h_tlrouter'

import Stream from 'components/Stream'

export default (state, actions) => (
    <main>
        <nav>

            <Link className='btn' to='/preferences'>🄿</Link>
            <a href='#' className='btn' onclick={ actions.refreshFollowList }>🅁</a>
        </nav>
        <section className='content' id='streamsWrap'>
            <div id='streams'>
                {
                    state.streams.length > 0
                    ? state.streams.map(stream => (
                        <Stream
                          stream={ stream }
                          key={ 'stream_'+stream }
                          openStream={ actions.openStream }/>
                    ))
                    : <p>No followed channels are currently live</p>
                }
            </div>
        </section>
    </main>
)
