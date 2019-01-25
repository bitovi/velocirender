const cookies = require("done-ssr/zones/cookies");
const debug = require("./debug");
const dom = require("can-zone-jsdom");
const pushFetch = require("done-ssr/zones/push-fetch");
const pushMutations = require("done-ssr/zones/push-mutations");
const pushXHR = require("done-ssr/zones/push-xhr");
const requests = require("done-ssr/zones/requests");
const supportsIncremental = require("./supports-incremental");
const debugZone = require("can-zone/debug");
const timeout = require("can-zone/timeout");
const Zone = require("can-zone");
const TimeoutError = timeout.TimeoutError;

function createZoneForRequest(options, mutationsUrl, request, response) {
	let { serverOptions, domOptions, streamMap } = options;

	let zones = [
		requests(request, serverOptions),
		dom(request, domOptions),
		cookies(request, response)
	];

	let timeoutZone = timeout(5000);
	zones.push(timeoutZone);

	if(debug.enabled) {
		zones.push(debugZone(timeoutZone));
	}

	if(supportsIncremental(request)) {
		zones.push(pushMutations(request, response, mutationsUrl, streamMap));
		zones.push(pushFetch(response));
		zones.push(pushXHR(response));
	}

	return new Zone(zones);
}

function isTimeoutError(err) {
	return (err instanceof TimeoutError);
}

exports.createZoneForRequest = createZoneForRequest;
exports.isTimeoutError = isTimeoutError;