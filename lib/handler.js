const {createZoneForRequest, isTimeoutError} = require("./zone");
const LRU = require('quick-lru');
const supportsIncremental = require("./supports-incremental");

function handler(serverOptions, resource) {
	let cacheHtml = serverOptions.cacheHtml !== false;
	let cacheMap = new LRU({ maxSize: 1000 });
	let streamMap = new LRU({ maxSize: 1000 });

	let options = Object.freeze({
		serverOptions, streamMap,
		domOptions: resource.domOptions
	});

	function requestHandler(request, response, next) {
		if(resource.isAsset(request.url)) {
			return void resource.handleAsset(request, response);
		}

		// Test if this a mutation stream
		if(streamMap.has(request.url)) {
			return sendMutations(response, streamMap.get(request.url));
		}

		// Test if this is a cached HTML page.
		let mutationsUrl = `/_mutations/${Date.now()}`;
		if(cacheMap.has(request.url)) {
			let html = cacheMap.get(request.url);
			let newHtml = replaceMutationUrl(html, mutationsUrl);
			sendHTML(response, newHtml);
		}

		// For a remote resource we have to wait for stuff to download the first time.
		if(!resource.ready) {
			resource.whenReady().then(() => {
				let html = render(options, mutationsUrl, request, response, next);

				if(cacheHtml && html && !cacheMap.has(request.url)) {
					cacheMap.set(request.url, html);
				}
			}, next);
		}

		// Render the request with zones/jsdom
		let html = render(options, mutationsUrl, request, response, next);

		if(cacheHtml && html && !cacheMap.has(request.url)) {
			cacheMap.set(request.url, html);
		}
	}

	return requestHandler;
}

function render(options, mutationsUrl, request, response, next) {
	let zone = createZoneForRequest(options, mutationsUrl, request, response);

	let runPromise = zone.run(void 0);
	runPromise.catch(logErrors(zone, next));
	
	if(supportsIncremental(request)) {
		let html = "<!doctype html>" + zone.data.html;
		sendHTML(response, html);
		return html;
	}
	else {
		runPromise = runPromise.then(data => {
			let html = "<!doctype html>" + data.html;
			sendHTML(response, html);
		});
	}
}

const mutationsExp = /&quot;\/_mutations\/[0-9]+&quot;/g;
function replaceMutationUrl(html, mutationsUrl) {
	let replacement = `&quot;${mutationsUrl}&quot;`;
	return html.replace(mutationsExp, () => replacement);
}

function sendMutations(response, stream) {
	if(response.writeHead) {
		response.writeHead(200, {
			"content-type": "application/x-mutationstream",
			"transfer-encoding": "chunked"
		});
	} else {
		response.respond({
			":status": 200,
			"content-type": "application/x-mutationstream",
			"transfer-encoding": "chunked"
		});
	}
	stream.pipe(response);
}

function sendHTML(response, html) {
	if(response.headersSent) {
		return;
	}

	if(response.writeHead) {
		response.writeHead(200, {
			"transfer-encoding": "chunked",
			"content-type": "text/html",
			"content-length": Buffer.byteLength(html)
		});
	} else {
		response.respond({
			":status": 200,
			"transfer-encoding": "chunked",
			"content-type": "text/html",
			"content-length": Buffer.byteLength(html),
		});
	}
	response.end(html);
}

function logErrors(zone, next) {
	return function(err) {
		if(isTimeoutError(err)) {
			if(zone.data.debugInfo) {
				for(let item of zone.data.debugInfo) {
					console.error(item.stack);
				}
			}
		}
		next(err);
	}
}

module.exports = handler;