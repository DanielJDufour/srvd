const test = require("flug");
const srvd = require("../srvd");

test("shutting down via env", ({ eq }) => {
  srvd.serve();
  process.env.SRVD_PLZ_CLOSE = true;
});
