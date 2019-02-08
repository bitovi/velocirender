[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/bitovi/velocirender/blob/master/LICENSE.md)
[![npm version](https://badge.fury.io/js/%40bitovi%2Fvelocirender.svg)](https://badge.fury.io/js/%40bitovi%2Fvelocirender)
[![Build Status](https://travis-ci.org/bitovi/velocirender.svg?branch=master)](https://travis-ci.org/bitovi/velocirender)

# @bitovi/velocirender

Accelerated server-side rendering.

- [Install](#install)
- [Getting Started](https://github.com/bitovi/velocirender/blob/master/docs/getting-started.md)
- [Usage](#usage)
  - [CLI](#cli)
    - [Flags](#flags)
    - [Cache considerations](#cache-considerations)
  - [JavaScript API](#javascript-api)
    - [Callback argument](#callback-argument)
- [Browser Compatibility](#browser-compatibility)

## Install

Install from [npm](https://www.npmjs.com/):

```shell
npm install @bitovi/velocirender
```

Or [Yarn](https://yarnpkg.com/en/):

```shell
yarn add @bitovi/velocirender
```

## Getting Started

The [Getting Started guide](https://github.com/bitovi/velocirender/blob/master/docs/getting-started.md) goes over everything in much more depth but here is a primer.

Once you've installed Velocirender you can use the CLI to start a server and point at an HTTP(S) endpoint like so:

```shell
node_modules/.bin/velocirender https://bitovi.github.io/dog-things-react/
```

This will tell you to visit [http://localhost:8080](http://localhost:8080) where you see the sight load incrementally. [Continue on with the guide](https://github.com/bitovi/velocirender/blob/master/docs/getting-started.md) which walks you through what is happening and how to integrate this into your workflow.

## Usage

__Velocirender__ comes with CLI and JavaScript APIs.

### CLI

The command-line interface is the easiest way to use __Velocirender__. Provide a path to your production HTML file and a few options, if needed. The HTML file can be a local path or a remote HTTP(S) address:

__Locally__

```shell
node_modules/.bin/velocirender build/index.html
```

__Remote__

```shell
node_modules/.bin/velocirender https://bitovi.github.io/dog-things-react/
```

#### Flags

The following CLI flags are available for use:

* __--port__: Specify the port to use, otherwise __8080__ will be used.
* __--key__: An SSL key. This should match what is provided to [Node https](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).
* __--cert__: The SSL certificate. This should match what is provided to [Node https](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener).
* __--no-cache-html__: By default Velocirender caches the HTML skeleton (everything that occurs before API requests are made). For the vast majority of apps this is fine, but if you do something weird like write a `Math.random()` into your output you might need this (file an issue to discuss first, you almost definitely don't need it).

#### Cache considerations

When running from a remote HTTP(S) address, Velocirender will download static assets and serve them from a local cache. That cache will be used until the next time the server starts, at which time they'll be re-downloaded.

This means that a deployed Velocirender server doesn't need to be redeployed when you release a new version of your front-end app; but you *will* need to restart the server.

[See this issue](https://github.com/bitovi/velocirender/issues/15) for discussion on more advanced caching coming in the future.

### JavaScript API

__Velocirender__ takes a function that is given a *rendering context*. This includes a *document*, the *request* and *response* objects. A function is returned with a signature of `(request, response)` and can be used as [Express](https://expressjs.com/) middleware, directly with `require('http')`, etc.

Here's an example that uses [http module](https://nodejs.org/api/http.html) directly:

```js
const velocirender = require('@bitovi/velocirender');
const { ReactDOM, App } = require('./dist/webpack-build-whatever.js');

const handler = velocirender(({ document, request }) => {
  let root = document.createElement('div');
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  ReactDOM.render(React.createComponent(App), root);
});

require('http').createServer(handler).listen(8080);
```

Note the above doesn't handle serving static assets. If you are using the http module directly you probably already know how to handle this, but most will likely want to use a framework like [Express](https://expressjs.com/). Here's an example that does so:

```js
const velocirender = require('@bitovi/velocirender');
const { ReactDOM, App } = require('./dist/webpack-build-whatever.js');
const express = require('express');
const app = express();

// Add any normal Express middlware you use here.
app.use(express.static(__dirname + '/build', { index: false }));

// Add this last.
app.use(velocirender(({ document, request }) => {
  let root = document.createElement('div');
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  ReactDOM.render(React.createElement(App), root);
}));

app.listen(8080);
```

> *Note* that `{ index: false }` is provided to `express.static`. This disables [serving the index.html](https://expressjs.com/en/resources/middleware/serve-static.html#index) file for routes like `/`. This is disabled in this example because __Velocirender__ will handle those routes.

#### Callback argument

__Velocirender__ takes a handler function as its only argument. That function receives a context object that contains the following properties:

* __request__: The [request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) object from the HTTP request.
* __response__: The [response](https://nodejs.org/api/http.html#http_class_http_serverresponse) object from the request. Note that can set headers on this response, but you won't want to call `.write()` or `.end()` as Velocirender calls those itself.
* __document__: A [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) that is scoped to this request. You can modify this document just as you would in a browser. Typically you'll want to create a root element to render your application onto. This document is backed by [jsdom](https://github.com/jsdom/jsdom).
* __window__: A [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) object. This contains many (but not all) of the properties that are seen in a browser window.


#### velocirender.serve()

A second API works like the CLI. Give it a path or URL and options that match the CLI's options. It will create a server for the app.

```js
const velocirender = require('@bitovi/velocirender');

const server = velocirender.serve('https://bitovi.github.io/dog-things-react/', {
  port: 8089
});
```

The second argument options should match the available [CLI flags](#flags).

## Browser Compatibility

__Velocirender__ utilizes recent additions to the browser specs such as [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content), [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), and [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

As of today Velocirender rendering is possible in Chrome and Safari >=12.

In browsers that don't support these technology Velocirender will fallback to the traditional SSR method of waiting for a fully rendered page. We call these separate ___strategies___:

* __incremental__ strategy is for modern browsers with streaming capabilities.
* __legacy__ strategy is for older browsers.

## Changelog

See the [latest releases on GitHub](https://github.com/bitovi/velocirender/releases).

## License

[MIT](https://github.com/bitovi/velocirender/blob/master/license.md)
