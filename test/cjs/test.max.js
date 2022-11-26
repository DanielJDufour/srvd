const test = require("flug");
const utils = require("./utils.js");
const srvd = require("../../srvd");

test("max requests", async ({ eq }) => {
  const max_requests = 5;
  const { port } = srvd.serve({
    debug: true,
    max: max_requests,
    port: 8082,
    wait: Infinity
  });

  for (let i = 0; i < max_requests; i++) {
    const data = await utils.get({
      hostname: "localhost",
      port,
      path: "/package.json",
      method: "GET"
    });
    const { name } = JSON.parse(data);
    eq(name, "srvd");
  }

  for (let i = 0; i < max_requests; i++) {
    let message;
    try {
      await utils.get({
        hostname: "localhost",
        port,
        path: "/package.json",
        method: "GET"
      });
    } catch (error) {
      ({ message } = error);
    }
    eq(message, "connect ECONNREFUSED 127.0.0.1:8082");
  }
});
