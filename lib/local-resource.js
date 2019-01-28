const fs = require("fs");
const path = require("path");
const {hasStaticFlag} = require("./static-query");

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

	isAsset(url) {
		if(hasStaticFlag(url)) {
			return true;
		}

		return false;
	}

	handleAsset(request, response) {
		let dir = this.cacheDir();
		let pth = path.join(dir, "index.html");
		let stream = fs.createReadStream(pth);

		response.writeHead(200, {
			"content-type": "text/html"
		});
		stream.pipe(response);
	}
}

module.exports = LocalResource;