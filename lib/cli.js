const path = require("path");
const serve = require("done-serve");
const ssr = require("done-ssr");
const dom = require("can-zone-jsdom");

const defaultOptions = Object.freeze({
	port: 8080
});

module.exports = function(pth, options = defaultOptions) {
	let port = options.port || defaultOptions.port;
	let domOptions = {
		root: path.dirname(pth),
		html: path.basename(pth)
	};

	let render = ssr(false, {
		domZone: request => dom(request, domOptions)
	});

	return serve(port, {
		path: path.dirname(pth),
		ssr: () => (req, res, next) => {
			let stream = render(req);
			stream.on("error", next);
			stream.pipe(res);
		}
	});
};
