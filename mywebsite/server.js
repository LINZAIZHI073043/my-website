const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".mp3": "audio/mpeg" };

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const file = path.resolve(root, relative);
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end("Forbidden"); return; }
  fs.stat(file, (error, stat) => {
    const resolved = !error && stat.isDirectory() ? path.join(file, "index.html") : file;
    fs.readFile(resolved, (readError, data) => {
      if (readError) { response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not Found"); return; }
      response.writeHead(200, { "Content-Type": types[path.extname(resolved).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-cache" });
      response.end(data);
    });
  });
}).listen(port, "127.0.0.1", () => console.log(`NOVA site: http://127.0.0.1:${port}`));
