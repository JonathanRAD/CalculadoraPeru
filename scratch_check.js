const http = require('http');

http.get('http://localhost:3000', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const preloads = data.match(/<link[^>]+rel="preload"[^>]*>/gi) || [];
    console.log('--- PRELOAD TAGS ---');
    preloads.forEach(p => console.log(p));
    
    const imgMatches = data.match(/<img[^>]+machu_pichu[^>]*>/gi) || [];
    console.log('--- IMG TAGS ---');
    imgMatches.forEach(img => console.log(img));
  });
}).on('error', (err) => console.error(err));
