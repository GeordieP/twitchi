const { authedJSONRequest } = require('./util')
const getUserURL = 'https://api.twitch.tv/kraken/user'
let userObject

const fetchAndStoreUser = token => new Promise(async (resolve, reject) => {
    try {
        if (token == null || token.length === 0) {
            throw new Error('Could not fetch logged in user data: Passed token was missing or invalid')
        }

        // fetch and store the module userObject, then resolve it
        userObject = await authedJSONRequest(getUserURL, token)
        resolve(userObject)
    } catch(e) {
        console.error(e)
        reject(e)
    }
})

// if we've got no user object cached, return the promise returned from fetchAndStoreUser
// otherwise, return a resolved promise containing the cached user object
//
// example structure of response here:
// https://dev.twitch.tv/docs/v5/reference/users#get-user
module.exports.getUserData = token =>
    userObject == null
        ? fetchAndStoreUser(token)
        : Promise.resolve(userObject)

// fetch and store the user object, but don't return or resolve anything to caller
module.exports.updateCachedUserData = token => {
    fetchAndStoreUser(token)
        .then(() => {})
        .catch(console.error)
}

module.exports.clearCachedUserData = () => {
    userObject = null
}
