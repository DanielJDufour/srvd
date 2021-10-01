const http = require("http");

const serveStatic = require("serve-static");
const finalhandler = require("finalhandler");

const DEFAULT_PORT = 8080;

const TRUES = ["TRUE", "True", "true", true];

function serve({ acceptRanges = true, debug = false, wait = 60, root, port } = { acceptRanges: true, wait: 60 }) {
  // console.log(arguments);
  if (!root) {
    root = process.cwd();
    if (debug) console.log(`[srvd] root not set so using current working directory "${root}"`);
  }

  if (!port) port = process.env.SRVD_DEFAULT_PORT ? process.env.SRVD_DEFAULT_PORT : DEFAULT_PORT;
  port = parseInt(port);

  if (!wait) wait = 5;
  wait = parseInt(wait);
  if (debug) console.log(`[srvd] waiting ${wait} seconds for requests`);
  const wait_ms = wait * 1000;

  const serve = serveStatic(root, { acceptRanges });

  let last = Date.now();
  let server;

  let checkWaitTimeout, checkForCloseTimeout;

  function clearTimeouts() {
    if (checkWaitTimeout) clearTimeout(checkWaitTimeout);
    if (checkForCloseTimeout) clearTimeout(checkForCloseTimeout);
  }

  function checkWait() {
    if (Date.now() - last > wait_ms) {
      if (debug) console.log(`[srvd] we haven't received a request in ${wait} seconds, so closing the server`);
      clearTimeouts();
      server.close();
    }
  }

  function checkForCloseRequest() {
    if (TRUES.includes(process.env.SRVD_PLZ_CLOSE)) {
      clearTimeouts();
      server.close();
    }
  }

  server = http.createServer(function onRequest(req, res) {
    last = Date.now();
    serve(req, res, finalhandler(req, res));
  });

  server.listen(port);
  if (debug) console.log("[srvd] serving on port " + port);

  checkWaitTimeout = setInterval(checkWait, 500);
  checkForCloseTimeout = setInterval(checkForCloseRequest, 500);
  server.on("close", () => clearTimeouts());

  return { acceptRanges, debug, server, port, root, wait };
}

module.exports = { serve };

if (require.main === module) {
  const args = Array.from(process.argv);
  const str = args.join(" ");

  serve({
    debug: !!str.match(/-?-debug((=|== )(true|True|TRUE))?/),
    port: Array.prototype.slice.call(str.match(/-?-port(?:=|== )(\d+)/) || [], 1)[0],
    root: Array.prototype.slice.call(str.match(/-?-root(?:=|== )([^ ]+)/) || [], 1)[0],
    wait: Array.prototype.slice.call(str.match(/-?-wait(?:=|== )(\d+)/) || [], 1)[0]
  });
}
