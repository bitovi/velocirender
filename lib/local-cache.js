const dom = require("can-zone-jsdom");
const fetch = require("node-fetch");
const mime = require("mime");
const path = require("path");
const promisify = require("util").promisify;
const URL = require("url").URL;
const Zone = require("can-zone");

const mkdirp = promisify(require("mkdirp"));
const writeFile = promisify(require("fs").writeFile);

const cacheDir = path.join(__dirname, "..", ".inccache");

async function fetchAndCache(baseUrl, href) {
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

	let pth = path.join(cacheDir, href);
	await mkdirp(path.dirname(pth));
	await writeFile(pth, data, "utf8");
	return { data };
}

exports.dir = cacheDir;

function mimeType(url) {
	let ext = path.extname(url).substr(1);
	return mime.getType(ext);
}

exports.isAsset = function(url) {
	return !!mimeType(url);
};

exports.cache = async function(baseUrl, req, res) {
	let href = "." + req.url;
	let fetchResponse = await fetchAndCache(baseUrl, href);

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
};
