const path = require("path");

class LocalResource {
	constructor(pth) {
		this.pth = pth;
		this.domOptions = {
			root: path.dirname(pth),
			html: path.basename(pth)
		};
		this.ready = true;
	}

	cacheDir() {
		return path.dirname(this.pth);
	}

	isAsset() {
		return false;
	}
}

module.exports = LocalResource;