var useragent = require("useragent");

module.exports = function(headers = {}) {
	var uaString = headers["user-agent"] || "";
	var browser = useragent.is(uaString);

	return !browser.safari;
};