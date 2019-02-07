const LRU = require('quick-lru');
const supportsPreloadFetch = require("./supports-preloadfetch");

class HTMLCache {
	constructor() {
		this.withPreload = new LRU({ maxSize: 1000 });
		this.noPreload = new LRU({ maxSize: 1000 });
	}

	has(request) {
		let url = request.url;

		if(!supportsPreloadFetch(request)) {
			return this.noPreload.has(url);
		} else {
			return this.withPreload.has(url);
		}
	}

	get(request) {
		let url = request.url;

		if(!supportsPreloadFetch(request)) {
			return this.noPreload.get(url);
		} else {
			return this.withPreload.get(url);
		}
	}

	set(request, html) {
		let cache = this.withPreload;

		if(!supportsPreloadFetch(request)) {
			cache = this.noPreload;
		}

		cache.set(request.url, html);
	}
}

module.exports = HTMLCache;