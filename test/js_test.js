const assert = require("assert");
const http = require("http");
const fetch = require("node-fetch");
const velocirender = require("../");

const PORT = 8028;

describe("JavaScript API", function() {
	this.timeout(10000);

	describe('Plain JS app', function() {
		let context = {};
		let server, html;

		before(done => {
			const handler = velocirender((ctx) => {
				Object.assign(context, ctx);

				let doc = ctx.document;
				let div = doc.createElement('div');
				div.id = "root";
				div.textContent = 'It worked';
				doc.body.appendChild(div);
			});

			server = http.createServer(handler).listen(PORT, async () => {
				let res = await fetch(`http://localhost:${PORT}`);
				html = await res.text();
				done();
			});
		});

		after(done => {
			server.close(done);
		});

		it('Renders the HTML', () => {
			assert.ok(/id="root"/.test(html), "Rendered HTML");
		});

		it("Includes the request", () => {
			assert.ok(context.request, "request included");
		});

		it("Includes the response", () => {
			assert.ok(context.response, "response included");
		});

		it("Includes the document", () => {
			assert.ok(context.document, "document included");
		});

		it("Includes the window", () => {
			assert.ok(context.window, "window included");
		});
	});
});