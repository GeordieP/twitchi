<p align="center">
  <img alt="Twitchi" src="./resources/twitchi.png" width=220>
</p>

# Twitchi

A Twitch follow list viewer integrated with Streamlink.

<p align="center">
  <img alt="Twitchi" src="./docs/img/twitchi-home.png">
</p>


### Notable Features

- View streams using Streamlink, or in a Twitch pop-out player
- Maintain a list of favorite channels, sorted to the top of the list whenever they're live
- Automatically open chat whenever a stream is opened (optional)
- System notifications when streams go live (optional)



## See more information, installation instructions, and more:

### [geordiep.github.io/twitchi/](https://geordiep.github.io/twitchi/)

## Development Setup

1. Clone repository

```
git clone https://github.com/GeordieP/twitchi
cd twitchi
```

2. Install dependencies

- Run `yarn` or `npm i`

## Testing

- Run `yarn test` or `npm run test` or `jest` to run all tests.

## Development

- Run `yarn dev` or `npm run dev`.

  - This will run webpack-dev-server using the configuration file `config/webpack.dev.js`, and open an Electron window pointed at the default webpack-dev-server URL.

- It's recommended to also run Jest in watch mode while making changes. Run `yarn test --watch` or `npm run test --watch` or `jest --watch`.

  - It's best to do this in a separate terminal window so Jest and Webpack don't have to fight for output space.

## Building & Packaging

- To build the application to a directory in production mode (without packaging), run `yarn build` or `npm run build`.

  - Webpack will compile the application into the `build/` directory.

  - Once this is done, it's possible to open an Electron window based on the exported production mode build. Run `yarn electron` or `npm run electron`.

- To package the application for your current platform, run `yarn dist` or `npm run dist`.

  - This will first execute a Webpack build in production mode, then invoke electron-builder. The configuration for electron-builder is in the "build" section in package.json.

## NOTES

- `babel-plugin-resolver` and the matching plugin configuration in the package.json "babel" section are included so modules get resolved properly when running in test mode when they're imported from aliased paths (such as 'actions/actions.js'). We configure this so it only runs in the "test" environment scope (Jest sets NODE_ENV to "test" when it's running) because when we're in development or production mode Webpack handles the import resolving.
