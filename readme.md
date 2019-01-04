# @bitovi/incremental

Accelerated server-side rendering.

## Usage

### CLI

The command-line interface is the easiest way to use __incremental__.

### JavaScript API

__incremental__ takes a function that is given a *rendering context*. This includes a *document*, the *request* and *response* objects. A function is returned with a signature of `(request, response)` and can be used as [Express](https://expressjs.com/) middleware, directly with `require('http')`, etc.

```js
const incremental = require('@bitovi/incremental');

const { ReactDOM, App } = require('./dist/webpack-build-whatever.js');

const handler = incremental(({ document, request }) => {
  ReactDOM.render(React.createComponent(App), document.body);
});

require('http').createServer(handler);
```
