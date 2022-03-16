# Snapweb

Web client for [Snapcast](https://github.com/badaix/snapcast), optimized for mobile devices. Written in typescript using GatsbyJS and Grommet

## Setup

1. Run `nvm install && nvm use` in the directory, this will install and activate the needed node environment.
2. Run `yarn` to install the needed node packages, this may take some time depending on your network connection
3. Run `npm run build` to export the site to a `dist` folder, or `npm run start` to load the site for development at `localhost:8000`
4. Copy the created `public` directory to some path on your snapserver host and let the `[http] doc_root` in your `snapserver.conf` point to it
5. Restart `snapserver` and navigate with a browser to `http://<snapserver host>:1780`
6. Enjoy :)

## Setup as WebApp

On a compatible client (Android/iOS/etc) open `http://<snapserver host>:1780` and select in the menu `Add to homescreen`

## Screenshot

## Contributing

This webclient wraps Snapserver's [WebSocket API](https://github.com/badaix/snapcast/blob/master/doc/json_rpc_api/v2_0_0.md).  
Pull requests are highly appreciated, and thoroughly reviewed. Please check the list of [open issues](https://github.com/badaix/snapweb/issues).  
Branch from the `develop` branch and ensure it is up to date with the current `develop` branch before submitting your pull request.

High prio issues:

- Missing opus support [#8](https://github.com/badaix/snapweb/issues/8)
- Missing Vorbis support [#14](https://github.com/badaix/snapweb/issues/14)
- Seems that audio playback on iOS is not working [#18](https://github.com/badaix/snapweb/issues/18)

Please consider that one of the design goals is to keep the client small and simple.

## 🧐 What's inside?

A quick look at the top-level files and directories you'll see in a Gatsby project.

    .
    ├── node_modules
    ├── src
    ├── .gitignore
    ├── .prettierrc
    ├── gatsby-browser.js
    ├── gatsby-config.js
    ├── gatsby-node.js
    ├── gatsby-ssr.js
    ├── LICENSE
    ├── package-lock.json
    ├── package.json
    └── README.md

1.  **`/node_modules`**: This directory contains all of the modules of code that your project depends on (npm packages) are automatically installed.

2.  **`/src`**: This directory will contain all of the code related to what you will see on the front-end of your site (what you see in the browser) such as your site header or a page template. `src` is a convention for “source code”.

3.  **`.gitignore`**: This file tells git which files it should not track / not maintain a version history for.

4.  **`.prettierrc`**: This is a configuration file for [Prettier](https://prettier.io/). Prettier is a tool to help keep the formatting of your code consistent.

5.  **`gatsby-browser.js`**: This file is where Gatsby expects to find any usage of the [Gatsby browser APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/) (if any). These allow customization/extension of default Gatsby settings affecting the browser.

6.  **`gatsby-config.js`**: This is the main configuration file for a Gatsby site. This is where you can specify information about your site (metadata) like the site title and description, which Gatsby plugins you’d like to include, etc. (Check out the [config docs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/) for more detail).

7.  **`gatsby-node.js`**: This file is where Gatsby expects to find any usage of the [Gatsby Node APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/) (if any). These allow customization/extension of default Gatsby settings affecting pieces of the site build process.

8.  **`gatsby-ssr.js`**: This file is where Gatsby expects to find any usage of the [Gatsby server-side rendering APIs](https://www.gatsbyjs.com/docs/reference/config-files/gatsby-ssr/) (if any). These allow customization of default Gatsby settings affecting server-side rendering.

9.  **`LICENSE`**: This Gatsby starter is licensed under the 0BSD license. This means that you can see this file as a placeholder and replace it with your own license.

10. **`package-lock.json`** (See `package.json` below, first). This is an automatically generated file based on the exact versions of your npm dependencies that were installed for your project. **(You won’t change this file directly).**

11. **`package.json`**: A manifest file for Node.js projects, which includes things like metadata (the project’s name, author, etc). This manifest is how npm knows which packages to install for your project.

12. **`README.md`**: A text file containing useful reference information about your project.

## 🎓 Learning Gatsby

Looking for more guidance? Full documentation for Gatsby lives [on the website](https://www.gatsbyjs.com/). Here are some places to start:

- **For most developers, we recommend starting with our [in-depth tutorial for creating a site with Gatsby](https://www.gatsbyjs.com/tutorial/).** It starts with zero assumptions about your level of ability and walks through every step of the process.

- **To dive straight into code samples, head [to our documentation](https://www.gatsbyjs.com/docs/).** In particular, check out the _Guides_, _API Reference_, and _Advanced Tutorials_ sections in the sidebar.

## 💫 Deploy

[Build, Deploy, and Host On The Only Cloud Built For Gatsby](https://www.gatsbyjs.com/products/cloud/)

Gatsby Cloud is an end-to-end cloud platform specifically built for the Gatsby framework that combines a modern developer experience with an optimized, global edge network.
