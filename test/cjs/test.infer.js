const test = require("flug");
const utils = require("./utils.js");
const srvd = require("../../srvd");

test("testing inference", async ({ eq }) => {
  const { port } = srvd.serve({ debug: true, max: 1 });
  const result = await utils.get({
    hostname: "localhost",
    port,
    path: "/test/data/sample",
    method: "GET"
  });
  eq(result, "<!DOCTYPE html>\n<html>\n  <body>Hello, World!</body>\n</html>");
});
