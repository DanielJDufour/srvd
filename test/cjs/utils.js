const http = require("http");

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

module.exports = { get };
