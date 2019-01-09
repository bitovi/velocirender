const path = require("path");
const serve = require("done-serve");
const localRender = require("./local-render");
const remoteRender = require("./remote-render");
const cacheDir = remoteRender.cacheDir;

const defaultOptions = Object.freeze({
	port: 8080
});

const remoteExp = /https?:\/\//;

module.exports = function(pth, options = defaultOptions) {
	let port = options.port || defaultOptions.port;
	let isRemote = remoteExp.test(pth);
	let render = isRemote ? remoteRender(pth) : localRender(pth);

	return serve(port, {
		path: isRemote ? cacheDir : path.dirname(pth),
		index: false,
		ssr: () => (req, res, next) => {
			if(isRemote && remoteRender.isAsset(req.url)) {
				return void remoteRender.cache(pth, req, res);
			}

			let stream = render(req);
			stream.on("error", next);
			stream.pipe(res);
		}
	});
};
