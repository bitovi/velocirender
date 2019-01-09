const dom = require("can-zone-jsdom");
const fetch = require("node-fetch");
const localCache = require("./local-cache");
const path = require("path");
const {Readable, Writable} = require("stream");
const ssr = require("done-ssr");

exports = module.exports = function(url) {
	let pagePromise = loadPage(url);
	let render;

	return function(request) {
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

async function loadPage(url) {
	let res = await fetch(url);
	if(!res.ok) {
		throw res.status;
	}
	let html = await res.text();

	return html;
}

exports.cacheDir = localCache.dir;
exports.cache = localCache.cache;
exports.isAsset = localCache.isAsset;
