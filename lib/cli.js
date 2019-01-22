const serve = require("done-serve");
const LocalRender = require("./local-render");
const RemoteRender = require("./remote-render");

const defaultOptions = Object.freeze({
	port: 8080
});

const remoteExp = /https?:\/\//;

module.exports = function(pth, options = defaultOptions) {
	let port = Number(options.port || defaultOptions.port);
	let isRemote = remoteExp.test(pth);
	let renderer = isRemote ? new RemoteRender(pth) : new LocalRender(pth);

	return serve(port, {
		path: renderer.cacheDir(),
		index: false,
		ssr: () => (req, res, next) => {
			if(renderer.isAsset(req.url)) {
				return void renderer.handleAsset(req, res);
			}

			let stream = renderer.render(req);
			stream.on("error", next);
			stream.pipe(res);
		}
	});
};
