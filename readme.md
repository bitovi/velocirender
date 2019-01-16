# @bitovi/incremental

Accelerated server-side rendering.

- [Install](#install)
- [Usage](#usage)
  - [CLI](#cli)
    - [Flags](#flags)
    - [Cache considerations](#cache-considerations)
  - [JavaScript API](#javascript-api)
    - [Callback argument](#callback-argument)

## Install

Install from [npm](https://www.npmjs.com/):

```shell
npm install @bitovi/incremental
```

Or [Yarn](https://yarnpkg.com/en/):

```shell
yarn add @bitovi/incremental
```

## Usage

__incremental__ comes with CLI and JavaScript APIs.

### CLI

The command-line interface is the easiest way to use __incremental__. Provide a path to your production HTML file and a few options, if needed. The HTML file can be a local path or a remote HTTP(S) address:

__Locally__

```shell
node_modules/.bin/incremental build/index.html
```

__Remote__

```shell
node_modules/.bin/incremental https://bitovi.github.io/dog-things-react/
```

#### Flags

The following CLI flags are available for use:

* __--port__: Specify the port to use, otherwise __8080__ will be used.

#### Cache considerations

When running from a remote HTTP(S) address, incremental will download static assets and serve them from a local cache. That cache will be used until the next time the server starts, at which time they'll be re-downloaded.

This means that a deployed incremental server doesn't need to be redeployed when you release a new version of your front-end app; but you *will* need to restart the server.

[See this issue](https://github.com/bitovi/incremental/issues/15) for discussion on more advanced caching coming in the future.

### JavaScript API

__incremental__ takes a function that is given a *rendering context*. This includes a *document*, the *request* and *response* objects. A function is returned with a signature of `(request, response)` and can be used as [Express](https://expressjs.com/) middleware, directly with `require('http')`, etc.

Here's an example that uses [http module](https://nodejs.org/api/http.html) directly:

```js
const incremental = require('@bitovi/incremental');
const { ReactDOM, App } = require('./dist/webpack-build-whatever.js');

const handler = incremental(({ document, request }) => {
  let root = document.createElement('div');
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  ReactDOM.render(React.createComponent(App), root);
});

require('http').createServer(handler).listen(8080);
```

Note the above doesn't handle static assets. If you are using the http module directly you probably already know how to handle this, but most will likely want to use a framework like [Express](https://expressjs.com/). Here's an example that does so:

```js
const incremental = require('@bitovi/incremental');
const { ReactDOM, App } = require('./dist/webpack-build-whatever.js');
const express = require('express');
const app = express();

// Add any normal Express middlware you use here.
app.use(express.static(__dirname + '/build', { index: false }));

// Add this last.
app.use(incremental(({ document, request }) => {
  let root = document.createElement('div');
  root.setAttribute("id", "root");
  document.body.appendChild(root);
  ReactDOM.render(React.createComponent(App), root);
}));

app.listen(8080);
```

> *Note* that `{ index: false }` is provided to `express.static`. This disables [serving the index.html](https://expressjs.com/en/resources/middleware/serve-static.html#index) file for routes like `/`. This is disabled in this example because __incremental__ will handle those routes.

#### Callback argument

__incremental__ takes a handler function as its only argument. That function receives a context object that contains the following properties:

* __request__: The [request](https://nodejs.org/api/http.html#http_class_http_incomingmessage) object from the HTTP request.
* __response__: The [response](https://nodejs.org/api/http.html#http_class_http_serverresponse) object from the request. Note that can set headers on this response, but you won't want to call `.write()` or `.end()` as incremental calls those itself.
* __document__: A [document](https://developer.mozilla.org/en-US/docs/Web/API/Document) that is scoped to this request. You can modify this document just as you would in a browser. Typically you'll want to create a root element to render your application onto. This document is backed by [jsdom](https://github.com/jsdom/jsdom).
* __window__: A [window](https://developer.mozilla.org/en-US/docs/Web/API/Window) object. This contains many (but not all) of the properties that are seen in a browser window.

## Changelog

See the [latest releases on GitHub](https://github.com/bitovi/incremental/releases).

## License

[MIT](https://github.com/bitovi/incremental/blob/master/license.md)
