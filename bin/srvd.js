#!/usr/bin/env node

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");

const serveStatic = require("serve-static");
const finalhandler = require("finalhandler");

const DEFAULT_PORT = 8080;

const TRUES = ["TRUE", "True", "true", true];

function serve(
  { acceptRanges = true, debug = false, infer = true, log = console.log, max = Infinity, wait = 60, root, port } = {
    acceptRanges: true,
    infer: true,
    max: Infinity,
    wait: 60
  }
) {
  if (!root) {
    root = process.cwd();
    if (debug) log(`[srvd] root not set so using current working directory "${root}"`);
  }

  if (max === undefined || max === null) max = Infinity;
  if (debug) log(`[srvd] serving ${max} requests`);

  if (!port) port = process.env.SRVD_DEFAULT_PORT ? process.env.SRVD_DEFAULT_PORT : DEFAULT_PORT;
  port = parseInt(port);

  if (!wait) wait = 5;
  wait = wait === Infinity ? wait : parseInt(wait);
  if (debug) log(`[srvd] waiting ${wait} seconds for requests`);
  const wait_ms = wait * 1000;

  const _serve = serveStatic(root, { acceptRanges });

  let last = Date.now();
  let server;
  const sockets = [];

  let checkWaitTimeout, checkForCloseTimeout;

  function clearTimeouts() {
    if (checkWaitTimeout) clearTimeout(checkWaitTimeout);
    if (checkForCloseTimeout) clearTimeout(checkForCloseTimeout);
  }

  function destroySockets() {
    sockets.forEach(socket => {
      try {
        socket.destroy();
      } catch (err) {
        // pass
      }
    });
  }

  function checkWait() {
    if (Date.now() - last > wait_ms) {
      if (debug) log(`[srvd] we haven't received a request in ${wait} seconds, so closing the server`);
      destroySockets();
      server.close();
    }
  }

  function checkForCloseRequest() {
    if (TRUES.includes(process.env.SRVD_PLZ_CLOSE)) {
      server.close();
    }
  }

  let count = 0;

  server = http.createServer(function onRequest(req, res) {
    count++;
    last = Date.now();
    if (debug) log(`[srvd] received a "${req.method}" request for "${req.url}"`);

    let filepath = path.join(root, req.url);
    if (infer && !fs.existsSync(filepath) && fs.existsSync(filepath + ".html")) {
      if (debug) console.log(`[srvd] inferred ${req.url}.html`);
      req.url += ".html";
    }

    _serve(req, res, finalhandler(req, res));
    if (count >= max) {
      if (debug) log("[srvd] reached maximum number of requests " + max);
      server.close();
    }
  });

  server.on("connection", socket => {
    sockets.push(socket);
  });

  server.listen(port);
  if (debug) log("[srvd] serving on port " + port);
  if (debug) log("[srvd] visit at http://localhost:" + port);

  checkWaitTimeout = setInterval(checkWait, 500);
  checkForCloseTimeout = setInterval(checkForCloseRequest, 500);
  server.on("close", () => {
    if (debug) log(`[srvd] served ${count} requests`);
    if (debug) log("[srvd] closed server");
    clearTimeouts();
  });

  return { acceptRanges, debug, infer, log, max, server, port, root, wait };
}

const srvd = { serve };

if (typeof module === "object") {
  module.exports = srvd;
  module.exports.default = srvd;
}

if (require.main === module) {
  const args = Array.from(process.argv);
  const str = args.join(" ");

  let wait = Array.prototype.slice.call(str.match(/-?-wait(?:=|== )(inf(inity)?|\d+)/i) || [], 1)[0];
  if (wait?.toLowerCase().startsWith("inf")) wait = Infinity;

  serve({
    debug: !!str.match(/-?-debug((=|== )(true|True|TRUE))?/),
    infer: !!str.match(/-?-infer((=|== )(true|True|TRUE))?/),
    max: Array.prototype.slice.call(str.match(/-?-max(?:=|== )(\d+)/) || [], 1)[0],
    port: Array.prototype.slice.call(str.match(/-?-port(?:=|== )(\d+)/) || [], 1)[0],
    root: Array.prototype.slice.call(str.match(/-?-root(?:=|== )([^ ]+)/) || [], 1)[0],
    wait
  });
}
