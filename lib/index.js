const createHandler = require("./handler");
const Zone = require("can-zone");

const resource = Object.freeze({
	ready: true,
	isAsset() {
		return false;
	}
});

exports = module.exports = function(callback) {
	function onNewZone() {
		let data = Zone.current.data;
		let context = Object.assign({}, data);
		callback(context);
	}

	let serverOptions = {
		cacheHtml: false,
		fn: onNewZone
	};

	return createHandler(serverOptions, resource);
};

exports.serve = require("./cli");