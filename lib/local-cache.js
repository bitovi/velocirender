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
		// Just don't cache, I guess?
		return;
	}

	let data = await res.text();

	let pth = path.join(cacheDir, href);
	await mkdirp(path.dirname(pth));
	await writeFile(pth, data, "utf8");
	return data;
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
	let data = await fetchAndCache(baseUrl, "." + req.url);

	if(data) {
		res.writeHead(200, {
			"Content-Type": mimeType(req.url),
			"Content-Length": Buffer.byteLength(data)
		});
		res.end(data);
	} else {
		console.log("Unable to fetch", req.url);
	}
};
