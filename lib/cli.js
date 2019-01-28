const serve = require("done-serve");
const LocalResource = require("./local-resource");
const RemoteResource = require("./remote-resource");
const createHandler = require("./handler");

const defaultOptions = Object.freeze({
	port: process.env.PORT || 8080
});

const remoteExp = /https?:\/\//;

module.exports = function(pth, options = defaultOptions) {
	let port = Number(options.port || defaultOptions.port);
	let isRemote = remoteExp.test(pth);
	let resource = isRemote ? new RemoteResource(pth) : new LocalResource(pth);
	let handler = createHandler(options, resource);

	return serve(port, {
		path: resource.cacheDir(),
		index: false,
		ssr: () => (request, response, next) => {
			try {
				handler(request, response, next);
			} catch(err) {
				next(err);
			}
		}
	});
};