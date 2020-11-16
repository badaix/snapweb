# Snapweb

Web client for [Snapcast](https://github.com/badaix/snapcast), optimized for mobile devices, with the look and feel of [Snapdroid](https://github.com/badaix/snapdroid)

## Setup

1. Run `make` (requires [TypeScript](https://www.typescriptlang.org/)) and copy the created `dist` directory to some path on your snapserver host and let the `[http] doc_root` in your `snapserver.conf` point to it
2. Restart `snapserver` and navigate with a browser to `http://<snapserver host>:1780`
3. Enjoy :)

## Setup as WebApp

On Android open `http://<snapserver host>:1780` in Chrome and select in the menu `Add to homescreen`

## Screenshot

![Snapweb](https://raw.githubusercontent.com/badaix/snapweb/master/snapweb.png)

## Contributing

This web client is the author's first JavaScript/TypeScript project and is rather a proof of concept for the Snapserver's [WebSocket API](https://github.com/badaix/snapcast/blob/master/doc/json_rpc_api/v2_0_0.md).  
Since my time and my web development skills are limited, pull requests are highly appreciated. Please check the list of [open issues](https://github.com/badaix/snapweb/issues).  
Branch from the `develop` branch and ensure it is up to date with the current `develop` branch before submitting your pull request.

High prio issues:

- Missing opus support [#8](https://github.com/badaix/snapweb/issues/8)
- Missing Vorbis support [#14](https://github.com/badaix/snapweb/issues/14)
- Missing toggle to show/hide offline clients [#7](https://github.com/badaix/snapweb/issues/7)
- Missing "About" dialog showing the version number and license [#15](https://github.com/badaix/snapweb/issues/15)
- Missing version number [#15](https://github.com/badaix/snapweb/issues/15)
- Seems that audio playback on iOS is not working [#18](https://github.com/badaix/snapweb/issues/18)

Please consider that one of the design goals is to keep the client small and simple, i.e. to use plain TypeScript/CSS without any frameworks.
