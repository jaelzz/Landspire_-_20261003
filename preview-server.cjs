// Local preview only. No dependencies or build step required.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.json':'application/json','.pdf':'application/pdf','.md':'text/plain; charset=utf-8','.xlsx':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
http.createServer((req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!target.startsWith(root+path.sep)||path.relative(root,target).split(path.sep).some(p=>p.startsWith('.'))){res.writeHead(403);res.end();return;}
    const ext=path.extname(target);
    if(!types[ext]){res.writeHead(404);res.end();return;}
    fs.readFile(target,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':types[ext],'Cache-Control':'no-store'});res.end(error?'Not found':data);});
  } catch {res.writeHead(400);res.end('Bad request');}
}).listen(port,()=>console.log(`Landspire preview: http://localhost:${port}`));
