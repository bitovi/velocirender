const fetch = require("node-fetch");
const LocalCache = require("./local-cache");

class RemoteResource {
	constructor(url) {
		this.url = url;
		this.cache = new LocalCache(url);

		this.ready = false;
		this.domOptions = {};

		this._loadPromise = this._load(url);
	}

	cacheDir() {
		return this.cache.cacheDir;
	}

	isAsset(url) {
		return this.cache.isAsset(url);
	}

	handleAsset(req, res) {
		return this.cache.add(req, res);
	}

	whenReady() {
		return this._loadPromise;
	}

	async _load(url) {
		let html = await loadPage(url);

		this.domOptions.html = html;
		this.domOptions.root = url;
		this.ready = true;
	}
}

async function loadPage(url, follows = 0) {
	let res = await fetch(url, {
		redirect: 'manual'
	});
	
	if(res.status === 301 || res.status === 302) {
		if(follows > 5) {
			throw new Error('Too many redirects.');
		}

		let location = res.headers.get('location');
		return loadPage(location, follows++);
	}

	if(!res.ok) {
		throw new Error(res.status);
	}

	let html = await res.text();
	
	return html;
}

module.exports = RemoteResource;