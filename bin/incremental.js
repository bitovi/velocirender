#!/usr/bin/env node

require("../lib/cli")(process.argv[2]);
console.error(`Servering your app at http://localhost:${8080}`);
