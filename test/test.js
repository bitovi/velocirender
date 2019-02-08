const mochas = require("spawn-mochas");

mochas([
	"cli_test.js",
	"js_test.js",
	"js_cli_test.js"
], __dirname);
