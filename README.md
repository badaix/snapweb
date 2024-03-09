# Snapweb

Web client for [Snapcast](https://github.com/badaix/snapcast), optimized for
mobile devices, with the look and feel of
[Snapdroid](https://github.com/badaix/snapdroid)

## Develop

1. Add your snapserver host as a local environment var
    ```bash
    echo 'VITE_APP_SNAPSERVER_HOST = localhost:1780' > .env.local
    ```
1. Install dependencies
    ```bash
    npm ci
    ```
1. Run local web server and watcher
    ```bash
    npm run dev
    ```

## Build for production

1. Install dependencies: `npm ci`
1. Build: `npm run build`
1. Copy the created `dest` directory to some path on your snapserver host and
   let the `[http] doc_root` in your `snapserver.conf` point to it
1. Restart `snapserver` and navigate with a browser to
   `http://<snapserver host>:1780`
1. Enjoy :)

Prebuilt versions can be downloaded as zip archive or debian package in [Releases](https://github.com/badaix/snapweb/releases).

## Setup as WebApp

On Android open `http://<snapserver host>:1780` in Chrome and select in the menu
`Add to homescreen`

## Screenshot

Screenshot is taken on a Pixel 7 emulation in Chrome DevTools

![Snapweb-Dark](https://raw.githubusercontent.com/badaix/snapweb/master/snapweb_dark.png#gh-dark-mode-only)
![Snapweb-Light](https://raw.githubusercontent.com/badaix/snapweb/master/snapweb_light.png#gh-light-mode-only)

## Contributing

Since my time and my web development skills are limited, pull requests are
highly appreciated. Please check the list of
[open issues](https://github.com/badaix/snapweb/issues).\
Branch from the `develop` branch and ensure it is up to date with the current
`develop` branch before submitting your pull request.

High prio issues:

- Missing opus support [#8](https://github.com/badaix/snapweb/issues/8)
- Missing Vorbis support [#14](https://github.com/badaix/snapweb/issues/14)
