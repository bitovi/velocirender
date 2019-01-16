const dom = require("can-zone-jsdom");
const fetch = require("node-fetch");
const localCache = require("./local-cache");
const {Readable, Writable} = require("stream");
const ssr = require("done-ssr");

exports = module.exports = function(url) {
	let pagePromise = loadPage(url).then(response => {
		renderer.url = response.url;
		return response.html;
	})
	let render;

	let renderer = function(request) {
		if(render) {
			return render(request);
		}

		let hasRead = false;
		return new Readable({
			read() {
				if(hasRead) return;
				hasRead = true;

				pagePromise.then(html => {
					render = createRender(html, url);
					let readable = this;
					render(request).pipe(new Writable({
						write(chunk, enc, next) {
							readable.push(chunk);
							next();
						}
					}));
				});
			}
		});
	};

	return renderer;

	function createRender(html, url) {
		let domOptions = {
			html,
			root: url
		};

		return ssr(false, {
			domZone: request => dom(request, domOptions)
		});
	}
};

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
	
	return { html, url };
}

exports.cacheDir = localCache.dir;
exports.cache = localCache.cache;
exports.isAsset = localCache.isAsset;
