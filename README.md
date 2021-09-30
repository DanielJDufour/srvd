# srvd
Another Development Server.  Supports Range Requests.  Configure through Environmental Variables.

# basic usage
```bash
srvd
```

# install
```bash
npm install -D srvd
```

# advanced usage
## in JavaScript
```javascript
const srvd = require("srvd");

// note: all options are optional
const obj = srvd.serve({
  // whether to accept HTTP Range Requests to return partial files
  // default is true
  acceptRanges: true,

  // set debug to true to see increased logging messages like what port is being used
  // default is false
  debug: true,

  // port
  // default is 8088
  port: 3000,

  // root directory to serve files from
  // default is the common working directory
  root: "/tmp/test"
});
```
serve returns the following object:
```js
{
  // whether byte range requests are being served
  acceptRanges: true,

  // whether debug logging is on/off
  debug: true,

  // port server is running on 
  port: 3000,

  // root being used
  root: "/tmp/test",

  // the http server object being used
  server: Server
}
```

# in the terminal
You can just run `srvd`, but you have other options available:
```bash
srvd --accept-ranges=false --debug --port=8080 --root=$PWD/data
```

# even more advanced usage
## shutting the server down
If you want to shut the server down (but not kill the main NodeJS process),
you can run `server.close()` or setting the environmental variable `SRVD_PLZ_CLOSE` to `true` like `process.env.SRVD_PLZ_CLOSE=true`;