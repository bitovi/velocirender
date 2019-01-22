const fetch = require("node-fetch");
const mime = require("mime");
const path = require("path");
const promisify = require("util").promisify;
const slugify = require('@sindresorhus/slugify');
const URL = require("url").URL;

const mkdirp = promisify(require("mkdirp"));
const writeFile = promisify(require("fs").writeFile);

const cacheRoot = path.join(__dirname, "..", ".inccache");

function mimeType(url) {
	let ext = path.extname(url).substr(1);
	return mime.getType(ext);
}

class LocalCache {
	constructor(url) {
		this.baseUrl = url;
		let slug = slugify(url);
		this.cacheDir = path.join(cacheRoot, slug);
	}

	isAsset(url) {
		return !!mimeType(url);
	}

	async add(req, res) {
		let baseUrl = this.baseUrl;
		let href = "." + req.url;
		let fetchResponse = await this._fetchAndCache(baseUrl, href);
	
		if(fetchResponse.data) {
			let { data } = fetchResponse;
			res.writeHead(200, {
				"Content-Type": mimeType(req.url),
				"Content-Length": Buffer.byteLength(data)
			});
			res.end(data);
		} else {
			let { status, statusText } = fetchResponse;
			res.writeHead(status, {
				"Content-Length": Buffer.byteLength(statusText)
			});
			res.end(statusText);
		}
	}

	async _fetchAndCache(baseUrl, href) {
		let url = new URL(href, baseUrl).toString();
		let res = await fetch(url);
	
		if(!res.ok) {
			return {
				error: 'Unable to cache',
				status: res.status,
				statusText: res.statusText
			};
		}
	
		let data = await res.text();
	
		let pth = path.join(this.cacheDir, href);
		await mkdirp(path.dirname(pth));
		await writeFile(pth, data, "utf8");
		return { data };
	}
}

module.exports = LocalCache;