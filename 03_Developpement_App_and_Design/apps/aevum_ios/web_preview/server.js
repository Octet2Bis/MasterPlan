const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const trackingRouter = require('./tracking_router');

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:' + PORT}`);
  if (trackingRouter.handleTracking(req, res, parsedUrl)) return;

  if (req.url.startsWith('/career')) {
    const slug = req.url.split('/career/')[1]?.split('?')[0]?.trim() || 'gitbook';
    const possiblePaths = [
      path.join(__dirname, '..', '..', '..', '..', '02_Assistant_Personnel', 'Workspace', 'career', 'applications', slug),
      path.join(__dirname, '..', '02_Assistant_Personnel', 'Workspace', 'career', 'applications', slug),
      path.join(__dirname, '..', '..', '02_Assistant_Personnel', 'Workspace', 'career', 'applications', slug)
    ];
    const appDir = possiblePaths.find(p => fs.existsSync(p));
    if (!appDir) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`<h1>Dossier introuvable pour ${slug}</h1>`);
    }
    const files = fs.readdirSync(appDir);
    const cvFile = files.find(f => f.startsWith('CV_'));
    const pitchFile = files.find(f => f.startsWith('Message_Accroche_'));
    const cvText = cvFile ? fs.readFileSync(path.join(appDir, cvFile), 'utf8') : 'CV non généré.';
    const pitchText = pitchFile ? fs.readFileSync(path.join(appDir, pitchFile), 'utf8') : 'Message non généré.';

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dossier Candidature — ${slug.toUpperCase()}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0E14; color: #E6EDF3; padding: 20px; line-height: 1.6; max-width: 700px; margin: 0 auto; }
    h1 { font-size: 20px; color: #58A6FF; border-bottom: 1px solid #30363D; padding-bottom: 10px; }
    h2 { font-size: 16px; color: #7EE787; margin-top: 24px; }
    .card { background: #161B22; border: 1px solid #30363D; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
    pre { background: #0D1117; padding: 12px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; font-size: 13px; color: #C9D1D9; border: 1px solid #21262D; }
    .badge { display: inline-block; background: #238636; color: #FFF; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
    .btn { display: inline-block; background: #1F6FEB; color: #FFF; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; }
  </style>
</head>
<body>
  <div class="badge">100% Full Remote • Opportunité Growth</div>
  <h1>Dossier Candidature — ${slug.toUpperCase()}</h1>
  <div class="card">
    <h2>✉️ Message d'Accroche pour le Décideur</h2>
    <pre>${pitchText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
  <div class="card">
    <h2>📄 CV Sur-Mesure Calibré ATS</h2>
    <pre>${cvText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </div>
  <p style="text-align: center; margin-top: 30px;">
    <a class="btn" href="javascript:history.back()">← Retour Simulator</a>
  </p>
</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(html);
  }

  let reqPath = req.url === '/' ? '/index.html' : req.url;
  reqPath = reqPath.split('?')[0];
  
  let filePath = path.join(PUBLIC_DIR, reqPath);
  
  // Si le fichier direct n'existe pas et qu'il ne s'agit pas d'un asset spécifique, renvoyer index.html
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  // Support du streaming vidéo (Range Requests)
  if (ext === '.mp4' && fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${stat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache'
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': stat.size,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'no-cache'
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Redirection vers index.html pour éviter toute page blanche 404
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
          const indexContent = fs.readFileSync(indexPath);
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(indexContent);
          return;
        }
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`500 Server Error: ${err.code}`);
      }
    } else {
      // ZÉRO CACHE POUR LE DÉVELOPPEMENT LOCAL
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 AEVUM SIMULATOR DEV SERVER (NO-CACHE) ACTIVE`);
  console.log(`🌐 Accédez au simulateur sur : http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
