var useragent = require("useragent");

module.exports = function(request = {}) {
	var headers = request.headers || request;
	var uaString = headers["user-agent"] || "";
	var browser = useragent.is(uaString);

	return !browser.safari;
};