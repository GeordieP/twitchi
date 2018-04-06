const path = require('path')
const fs = require('fs-extra')

class VersNumWriterPlugin {
    constructor(opts) {
        this.output = path.join(opts.output, 'version.json')
        this.vers = opts.vers
    }

    apply() {
        fs.writeJson(this.output, { version: this.vers })
            .then(() => console.log(`Wrote version ${this.vers} to ${this.output}`))
            .catch(e => console.error)
    }
}

module.exports = VersNumWriterPlugin