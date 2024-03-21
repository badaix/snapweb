# Snapweb changelog

## Version 0.7.0-beta.1

### Features

- Configurable Snapserver host
- Apply dark or light theme depending on the system theme
- Show client name in Client settings
- PWA ready

### Bugfixes

- Fix several ESLint issues
- Fix Chrome DevTools issues

### General

- Switch from the deprecated Create React App (CRA) to Vite

_Johannes Pohl <snapweb@badaix.de>  Thu, 21 Mar 2024 00:13:37 +0200_

## Version 0.6.0

### Features

- Dark mode (Issue #38)
- Show track title, artist and album art
- Stream control: Play, pause, previous, next
- Support for showing disconnected devices (Issue #7)
- Show license and version information (Issue #15)
- Improved iOS playback (Issue #18, PR #45)

### Bugfixes

- HTML input is sanitized (Issue #36)

### General

- Rewrite of the GUI with React

_Johannes Pohl <snapweb@badaix.de>  Sat, 24 Feb 2024 00:13:37 +0200_

## Version 0.5.0

### Features

- Show list of artists

### Bugfixes

- Fix version in Hello message

### General

_Johannes Pohl <snapweb@badaix.de>  Sun, 05 Feb 2023 00:13:37 +0200_

## Version 0.4.0

### Features

- Add support for MediaSession

### Bugfixes

- Fix compilation with Typescript 4.4

### General

_Johannes Pohl <snapweb@badaix.de>  Wed, 22 Dec 2021 00:13:37 +0200_

## Version 0.3.0

### Features

- Recreate AudioContext if the stream changes

### Bugfixes

### General

_Johannes Pohl <snapweb@badaix.de>  Sat, 15 May 2021 00:13:37 +0200_

## Version 0.2.0

### Features

- Initial playback support on iOS (PR #18)

### Bugfixes

- Fix support for older browsers (PR #28)

### General

- Add version information as meta tag (not yet visible in the GUI) (PR #15)

_Johannes Pohl <snapweb@badaix.de>  Tue, 02 Mar 2021 00:13:37 +0200_

## Version 0.1.0

- Added deleteClient method (PR #4)

### Features

- Make URL base configurable (PR #20)
- Allow use of (https) reverse proxies by default (PR #25)
- Auto play when stream becomes available if URL hash contains 'autoplay' (PR #12)

### Bugfixes

- Fixed issue #21 (PR #22)
- Fix fallback code and increase compatibility with older browsers (PR #13)

### General

- Prefer localStorage over complicated cookie-based key-value store (PR #11)
- Auto-reconnect WebSockets if connection is lost (PR #23)
- Misc code improvements (PR #24)
- Turn on more tsc strictness options (PR #26)

_Johannes Pohl <snapweb@badaix.de>  Mon, 22 Feb 2021 00:13:37 +0200_

