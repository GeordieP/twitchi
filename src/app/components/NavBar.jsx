import { h } from 'hyperapp'
import { Link } from 'hyperapp-hash-router'

const applyCurRouteStyle = (curPath, routePath) =>
    routePath === curPath ? ' selected' : ''

export default (props, children) => (
    <nav>
        <div className='navBegin'>
            <Link to='/' title='Following List'>
                <i className={ 'fas fa-th' + applyCurRouteStyle(props.path, '/') } />
            </Link>

            <Link to='/launchStream' title='Open stream by username'>
                <i className={ 'fas fa-share-square' + applyCurRouteStyle(props.path, '/launchStream') } />
            </Link>
            <div className='navChildren'>
                { children }
            </div>
        </div>

        <div className='navEnd'>
            <Link to='/logs' title='Streamlink logs'>
                <i className={ 'fas fa-align-left' + applyCurRouteStyle(props.path, '/logs') } />
            </Link>
            <Link to='/preferences' title='Preferences'>
                <i className={ 'fas fa-cog' + applyCurRouteStyle(props.path, '/preferences') } />
            </Link>
        </div>
    </nav>
)
