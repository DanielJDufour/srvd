const http = require("http");
const test = require("flug");
const srvd = require("../srvd");

const get = options =>
  new Promise((resolve, reject) => {
    let data = "";
    const req = http.request(options, res => {
      res.on("data", chunk => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.end();
  });

test("max requests", async ({ eq }) => {
  const max_requests = 5;
  const { port } = srvd.serve({
    debug: true,
    max: max_requests,
    port: 8082,
    wait: Infinity
  });

  for (let i = 0; i < max_requests; i++) {
    const data = await get({
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
      await get({
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
