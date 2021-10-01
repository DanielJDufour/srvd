const test = require("flug");
const srvd = require("../srvd");

test("shutting down via callback", ({ eq }) => {
  const { server } = srvd.serve({ debug: true });
  server.close();
});
