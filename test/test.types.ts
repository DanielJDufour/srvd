import test from "flug";
import { serve } from "../srvd";

declare var process: any;

test("testing types", ({ eq }) => {
  const { acceptRanges, debug, max, server, port, root, wait } = serve();
  server.close();
  eq(acceptRanges, true);
  eq(debug, false);
  eq(max, Infinity);
  eq(port, 8080);
  eq(root, process.cwd());
  eq(wait, 60);
});
