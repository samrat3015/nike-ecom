const { createServer } = require("http");
const next = require("next");

const dev = false; // we are in production
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("🚀 Next.js SSR app running on http://localhost:3000");
  });
});
