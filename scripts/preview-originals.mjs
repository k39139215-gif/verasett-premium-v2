// Read-only access to the existing baseline builds. No Vite cache or source writes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.json':'application/json'};
for(const [edition,port] of [['verasett-ui-assets',5173],['verasett-ui-assets-boardui',5174]]){
  const root=path.resolve(project,'..',edition,'dist');
  if(!fs.existsSync(path.join(root,'index.html'))){console.error(`Existing ${edition}/dist is unavailable; no baseline build was attempted.`);continue;}
  const server=http.createServer((req,res)=>{
    try{
      const requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      let file=path.resolve(root,'.'+requested);
      if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
      if(!fs.existsSync(file)||fs.statSync(file).isDirectory())file=path.join(root,'index.html');
      res.writeHead(200,{'Content-Type':types[path.extname(file)]??'application/octet-stream','Cache-Control':'no-store'});
      fs.createReadStream(file).pipe(res);
    }catch{res.writeHead(400).end();}
  });
  server.on('error',err=>{if(err.code==='EADDRINUSE'||err.code==='EACCES')console.log(`Port ${port} is already in use or reserved; existing previews were left running.`);else console.error(err.message);});
  server.listen(port,'127.0.0.1',()=>console.log(`${edition} read-only preview: http://127.0.0.1:${port}`));
}
