const { URL } = require("url");
// Just for parsing, otherwise meaningless.
const address = "http://localhost:8080";

function hasStaticFlag(urlStr) {
	if(!urlStr) {
		return false;
	}

	let url = new URL(urlStr, address);
	return url.searchParams.get("_velocirender_static_") == "";
}

exports.hasStaticFlag = hasStaticFlag;