const test = require("flug");
const srvd = require("../../srvd");

test("shutting down after 3 seconds", ({ eq }) => {
  srvd.serve({
    debug: true,
    port: 8082,
    wait: 3
  });
});
