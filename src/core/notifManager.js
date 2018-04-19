const { Notification } = require('electron')

const config = require('./config')

// path works in prod mode (serves from /build/resources/twitchi.png) and
// in development mode (app serves from root, img from /resources/twitchi.png)
// NOTE: not using this for now, as most notification systems already show the app's icon by default
const TWITCHI_ICON_PATH = './resources/twitchi.png'

// maximum number of names to print in a live streams notification
const MAX_NUM_NAMES = 5

let MAIN_WINDOW

module.exports.init = mainWindow => {
    MAIN_WINDOW = mainWindow
}

// called with arrays of streams
const buildTitle = (fav, rest) => new Promise((resolve, reject) => {
    // special cases: only one stream live: print username and game.
    if (fav.length === 1 && rest.length === 0) {
        resolve(`${fav[0].channel.display_name} is live playing ${fav[0].channel.game}`)
        return
    } else if (fav.length === 0 && rest.length === 1) {
        resolve(`${rest[0].channel.display_name} is live playing ${rest[0].channel.game}`)
        return
    }

    let favLine = ''
    let restLine = ''

    if (fav.length > 0) {
        const pluralize = (fav.length > 1) ? 's' : ''
        favLine = `${fav.length} favorite${pluralize} `
    }

    // if there are some streams that aren't favs
    if (rest.length > 0) {
        const pluralize = (rest.length > 1) ? 's' : ''
        // if there are streams in favs AND rest, show 'and' & 'other' around the number.
        // otherwise just show the number.
        restLine = (fav.length > 0)
            ? `and ${rest.length} other stream${pluralize} `
            : `${rest.length} stream${pluralize} `
    }
    
    resolve(`${favLine}${restLine}went live`)
})

const buildBody = (fav, rest) => new Promise((resolve, reject) => {
    // special cases: only one stream live: Just print the stream title.
    if (fav.length === 1 && rest.length === 0) {
        resolve(`${fav[0].channel.status}`)
        return
    } else if (fav.length === 0 && rest.length === 1) {
        resolve(`${rest[0].channel.status}`)
        return
    }

    // merge the object back together from the two separated arrays
    // so it's sorted with the favorites at the beginning
    let allNames = [
        ...fav.map(s => s.channel.display_name),
        ...rest.map(s => s.channel.display_name),
    ]
    
    // truncate names down to the limit,
    // and keep track of the number we truncate in order to print later
    let countDiff = 0
    if (allNames.length > MAX_NUM_NAMES) {
        countDiff = allNames.length - MAX_NUM_NAMES
        allNames.splice(MAX_NUM_NAMES)
    }

    const allNamesString = allNames.join(', ')
    const restString = (countDiff > 0) ? `, and ${countDiff} more` : ''

    resolve(`${allNamesString}${restString}`)
})

module.exports.showLiveStreamsNotif = async streams => {
    if (streams.length === 0) return
    const allFav = config.get('favorite-streams')

    // split all streams into list of fav and rest
    let fav = [], rest = []
    for (let i = 0; i < streams.length; i++) {
        if (allFav.includes(streams[i].channel.name)) {
            fav.push(streams[i])
        } else {
            rest.push(streams[i])
        }
    }

    // create notification title and body from stream lists
    const [ title, body ] = await Promise.all([
        buildTitle(fav, rest),
        buildBody(fav, rest)
    ])

    new Notification({
        title,
        body,
        // icon: TWITCHI_ICON_PATH,
    }).show()
}
