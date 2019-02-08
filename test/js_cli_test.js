const assert = require("assert");
const http = require("http");
const fetch = require("node-fetch");
const velocirender = require("../");

const PORT = 8029;

describe("JavaScript CLI API", function() {
	this.timeout(10000);

	describe('Plain JS app', function() {
		let server;

		before(done => {
			let pth = __dirname + '/tests/basics/index.html', options = {
				port: PORT
			};
			server = velocirender.serve(pth, options);
			done();
		});

		after(done => {
			server.close(done);
		});

		it('Renders the HTML', async () => {
			let res = await fetch(`http://localhost:${PORT}`, {
				headers: {
					"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
				}
			});
			let html = await res.text();

			assert.ok(/<main>/.test(html), "Rendered with the initial HTML");
		});
	});
});