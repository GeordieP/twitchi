const { Notification } = require('electron')

const config = require('./config')

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
    
    // bun
    const begin = 'Twitchi:'
    const end = 'went live'

    // burger
    let favLine = ''
    let restLine = ''

    if (fav.length > 0) {
        // if more than one fav, pluralize
        favLine = (fav.length === 1)
            ? `${fav.length} favorite `
            : `${fav.length} favorites `
    }

    // if there are some streams that aren't favs
    if (rest.length > 0) {
        // if there are streams in favs AND rest, show 'and' & 'other' around the number.
        // otherwise just show the number.
        restLine = (fav.length > 0)
            ? `and ${rest.length} other `
            : `${rest.length} `
    }
    
    resolve(`${begin} ${favLine}${restLine}${end}`)
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

    let favString = fav.map(s => s.channel.name).join(', ')
    let restString = rest.map(s => s.channel.name).join(', ')
    let separator = ''
    if (fav.length > 0 && rest.length > 0) separator = ', '

    resolve(`${favString}${separator}${restString}`)
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

    new Notification({ title, body }).show()
}
