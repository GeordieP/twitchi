import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

export default (props, children) => (
    <nav>
        <div className='navBegin'>
            <Link to='/' title='Following List'>
                <i className='fas fa-th'></i> 
            </Link>

            <Link to='/launchStream' title='Open stream by username'>
              { /* <i className="fas fa-external-link-alt"></i> */ }
                <i className='fas fa-share-square'></i>
            </Link>
            <div className='navChildren'>
                { children }
            </div>
        </div>

        <div className='navEnd'>
            <Link to='/logs' title='Streamlink logs'>
                <i className='fas fa-align-left'></i> 
            </Link>
            <Link to='/preferences' title='Preferences'>
                <i className='fas fa-cog'></i> 
            </Link>
        </div>
    </nav>
)
