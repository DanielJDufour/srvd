#!/usr/bin/env node

const http = require("http");

const serveStatic = require("serve-static");
const finalhandler = require("finalhandler");

const DEFAULT_PORT = 8080;

function serve ({ acceptRanges = true, debug = false, root, port } = { acceptRanges: true }) {
  // console.log(arguments);
  if (!root) {
    root = process.cwd();
    if (debug) console.log(`[srvd] root not set so using current working directory "${root}"`);
  }

  if (!port) port = process.env.SRVD_DEFAULT_PORT ? process.env.SRVD_DEFAULT_PORT : DEFAULT_PORT;
  port = parseInt(port);

  const serve = serveStatic(root, {
    acceptRanges
  });

  const server = http.createServer(function onRequest(req, res) {
    serve(req, res, finalhandler(req, res));
  });

  server.listen(port);
  if (debug) console.log("[srvd] serving on port " + port);

  function checkForCloseRequest() {
    if (["TRUE","True","true"].includes(process.env.SRVD_PLZ_CLOSE)) {
      server.close();
    } else {
      setTimeout(() => checkForCloseRequest(), 500);
    }
  }
  setTimeout(() => checkForCloseRequest(), 500);

  return { acceptRanges, debug, server, port, root };
};

module.exports = { serve };

if (require.main === module) {
  const args = Array.from(process.argv);
  const str = args.join(" ");  

  serve({
    debug: !!str.match(/-?-debug((=|== )(true|True|TRUE))?/),
    port: Array.prototype.slice.call(str.match(/-?-port(?:=|== )(\d+)/) || [], 1)[0],
    root: Array.prototype.slice.call(str.match(/-?-root(?:=|== )([^ ]+)/) || [], 1)[0]
  });
}