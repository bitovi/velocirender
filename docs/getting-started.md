
# Getting Started

[@bitovi/incremental](https://github.com/bitovi/incremental) provides a web-server for [Single-page apps](https://en.wikipedia.org/wiki/Single-page_application) that is optimized for speed. By striking a balance between traditional server-side rendering and client-only rendering we are able to get the best of both worlds. A partially rendered page is delivered to the browser immediately; allowing critical assets such as CSS and JavaScript to begin being fetched. Meanwhile rendering instructions are [streamed](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) from the server to the browser allowing the user to see page content before the application has fully booted up.

## Installing

> incremental requires [Node.js](https://nodejs.org) 10.0 and above.

To install incremental use one of the following commands:

```shell
npm install -g @bitovi/incremental
```

*or*

```shell
yarn global add @bitovi/incremental
```

This will add a new utility, `incremental` to your PATH. You can check the version you have installed by running:

```shell
incremental --version
```

## Try it out

You can play around with and see the effects of incremental rendering without writing any code. Our [example apps](#example-apps) were written for the most popular frameworks and you can connect to them remotely.

```shell
incremental https://bitovi.github.io/dog-things-react
```

Then navigate to [http://localhost:8080](http://localhost:8080) in your browser. You won't notice a big difference from a high-speed connection so we recommend tuning down to a 3G connection.

In Chrome Developer Tools you can do this by clicking __Network__ and then changing the dropdown that says __Online__ to __Slow 3G__ instead:

<img width="1042" alt="Turning network down to 3G connection" src="https://user-images.githubusercontent.com/361671/51325670-703dc600-1a3b-11e9-98d2-336fe0f7191e.png">

Now when you compare the page load time using incremental vs. the client-only page you should see quite a difference of:

* The [App Shell](https://developers.google.com/web/fundamentals/architecture/app-shell) is displayed immediately (the header, sidebar, etc).
* Items within the product list are streamed in more quickly. This is because the API request is first made on the server.

## Example apps

To make it easier getting started with incremental we've created React, Vue, and Angular example apps. These apps are built using the standard tooling for each framework.

### React

The [dog-things-react](https://github.com/bitovi/dog-things-react) project was created using [Create React App](https://facebook.github.io/create-react-app/).

You can try out incremental rendering this project locally using:

```shell
incremental https://bitovi.github.io/dog-things-react
```

Or clone and then run:

```shell
npm install
npm start
```

This will open the app in development mode. You can modify the files and it will reload the browser. To build you do:

```shell
npm run build
npm run prod
```

This will serve up the production build from the `build/` folder.

### Vue

The [dog-things-vue](https://github.com/bitovi/dog-things-vue) project was created using [Vue CLI](https://cli.vuejs.org/).

You can try out incremental rendering this project locally using:

```shell
incremental https://bitovi.github.io/dog-things-vue
```

To develop on the app you can clone it and then run:

```shell
npm run serve
```

Which builds the app in development mode and starts a server. To see the incremental version build for production run:

```shell
npm run build
npm run prod
```

The built version will be in the `dist/` folder.

## Browser Compatibility

__incremental__ utilizes recent additions to the browser specs such as [preload](https://developer.mozilla.org/en-US/docs/Web/HTML/Preloading_content), [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), and [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream).

As of today incremental rendering is possible in Chrome and Safari >=12.

In browsers that don't support these technology incremental will fallback to the traditional SSR method of waiting for a fully rendered page. We call these separate ___strategies___:

* __incremental__ strategy is for modern browsers with streaming capabilities.
* __legacy__ strategy is for older browsers.

## Deployment

You can deploy your application to any of the many cloud Node.js hosting providers such as [Google Cloud](https://cloud.google.com/nodejs/), [AWS EC2](https://aws.amazon.com/ec2/) or [Heroku](https://heroku.com).

[Function as a service](https://en.wikipedia.org/wiki/Function_as_a_service) providers (sometimes called *serverless*) like AWS Lambda is not a viable option at this time, because none of these providers currently support streaming responses. Once they've added that capability we'll explore how incremental can be integrated into those platforms.

### Remote vs Local

Currently it is recommended to deploy the application in the same manner you would any server-side app. How you do this will depend on your provider, but ultimately you'll want have it run the CLI command:

```shell
node_modules/.bin/incremental path/to/index.html
```

Where `path/to/index.html` is the path to your production HTML file (React's is `build/index.html` for example).

Every time you want to do a new release of your application you will need to redeploy the code and restart the server.

In the future it will be possible to run incremental against __remote__ URLs in your production environment. What this will do is download your application from a remote URL and cache the assets locally. This won't be practical, however, until we figure out a way to [expire the cache](https://github.com/bitovi/incremental/issues/15).

What this will mean is that you will only ever need to deploy your back-end code *once*. From then on you can simply deploy the client-side application to some publicly accessible CDN and the server will download the new version when its cache expires.

## Next Steps

We invite you to join the [Bitovi Community Slack](https://tinyurl.com/BitoviCommunitySlack) and come to the __#performance__ room to get help from the community on setting up incremental rendering in your application.