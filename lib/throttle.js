const { Readable, Writable } = require("stream");
const Throttle = require("throttle");

module.exports = function(options, request, response, next) {
	let readable = new Readable({ read() {} });
	let rate = Number(options.throttle || 750000);
	let latency = (rate / 2) / 1000;
	let throttle = new Throttle(rate);

	let setHeader = response.setHeader;
	response.setHeader = function(a, b) {
		if(a.toLowerCase() === "content-encoding") {
			if(b === "gzip") {
				return;
			}
		}
		
		return setHeader.call(response, a, b);
	}

	let write = response.write;
	let throttleWrite = function(chunk, enc) {
		readable.push(chunk, enc);
	};
	Object.defineProperty(response, "write", {
		get: function() {
			return throttleWrite;
		},
		set: function() {}
	});

	let end = response.end;
	let throttledEnd = function(chunk, enc) {
		readable.push(chunk, enc);
		readable.push(null);
	};
	Object.defineProperty(response, 'end', {
		get: function() {
			return throttledEnd;
		},
		set: function() {}
	});

	readable.pipe(throttle).pipe(new Writable({
		write(chunk, enc, next) {
			write.call(response, chunk, enc, next);
		},

		final() {
			end.call(response);
		}
	}));

	setTimeout(next, latency);
};