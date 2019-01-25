const useragent = require("useragent");

module.exports = function(requestOrHeaders) {
	let headers = requestOrHeaders.headers || requestOrHeaders;
	let uaString = headers["user-agent"] || "";
	let agent = useragent.lookup(uaString);
	let browser = useragent.is(uaString);

	return agent.family !== "Edge" && (browser.chrome || browser.safari);
};