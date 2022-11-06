import test from "flug";
import { serve } from "../../srvd";

declare const process: any;

test("logging", ({ eq }) => {
  const logs: string[] = [];
  const log = (...args: any) => logs.push(args.toString());
  const wait = Infinity;
  serve({
    debug: true,
    log,
    max: 0,
    wait
  });
  process.env.SRVD_PLZ_CLOSE = true;
  eq(logs.includes(`[srvd] waiting ${wait} seconds for requests`), true);
});
