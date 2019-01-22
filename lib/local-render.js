const dom = require("can-zone-jsdom");
const path = require("path");
const ssr = require("done-ssr");

class LocalRender {
	constructor(pth) {
		this.pth = pth;

		let domOptions = {
			root: path.dirname(pth),
			html: path.basename(pth)
		};
	
		this.render = ssr(false, {
			domZone: request => dom(request, domOptions)
		});
	}

	cacheDir() {
		return path.dirname(this.pth);
	}

	isAsset() {
		return false;
	}
}

module.exports = LocalRender;