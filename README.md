# Snapweb

Web client for [Snapcast](https://github.com/badaix/snapcast), optimized for
mobile devices, with the look and feel of
[Snapdroid](https://github.com/badaix/snapdroid)

## Develop
1. Add your snapserver host as a local environment var
    ```bash
    echo 'REACT_APP_SNAPSERVER_HOST = localhost:1780' > .env.local
    ```
1. Install dependencies
    ```bash
    npm ci
    ```
1. Run local web server and watcher
    ```bash
    npm start
    ```

## Build for production
1. Install dependencies: `npm ci`
1. Build: `npm run build`
1. Copy the created `build` directory to some path on your snapserver host and
   let the `[http] doc_root` in your `snapserver.conf` point to it
1. Restart `snapserver` and navigate with a browser to
   `http://<snapserver host>:1780`
1. Enjoy :)

## Setup as WebApp

On Android open `http://<snapserver host>:1780` in Chrome and select in the menu
`Add to homescreen`

## Screenshot

_TODO: update me!_
![Snapweb](https://raw.githubusercontent.com/badaix/snapweb/master/snapweb.png)

## Contributing

_TODO: update me!_
This web client is the author's first JavaScript/TypeScript
project and is rather a proof of concept for the Snapserver's
[WebSocket API](https://github.com/badaix/snapcast/blob/master/doc/json_rpc_api/v2_0_0.md).\
Since my time and my web development skills are limited, pull requests are
highly appreciated. Please check the list of
[open issues](https://github.com/badaix/snapweb/issues).\
Branch from the `develop` branch and ensure it is up to date with the current
`develop` branch before submitting your pull request.

High prio issues:

- Missing opus support [#8](https://github.com/badaix/snapweb/issues/8)
- Missing Vorbis support [#14](https://github.com/badaix/snapweb/issues/14)
- Missing toggle to show/hide offline clients
  [#7](https://github.com/badaix/snapweb/issues/7)
- Missing "About" dialog showing the version number and license
  [#15](https://github.com/badaix/snapweb/issues/15)
- Missing version number [#15](https://github.com/badaix/snapweb/issues/15)

Please consider that one of the design goals is to keep the client small and
simple, i.e. to use plain TypeScript/CSS without any frameworks.
