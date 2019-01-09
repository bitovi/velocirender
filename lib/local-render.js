const dom = require("can-zone-jsdom");
const path = require("path");
const ssr = require("done-ssr");

module.exports = function(pth) {
	let domOptions = {
		root: path.dirname(pth),
		html: path.basename(pth)
	};

	let render = ssr(false, {
		domZone: request => dom(request, domOptions)
	});

	return render;
};
