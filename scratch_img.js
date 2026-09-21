const http = require('http');

function checkImg(w, q) {
  const url = `http://localhost:3000/_next/image?url=%2Fmachu_pichu.jpg&w=${w}&q=${q}`;
  http.get(url, { headers: { 'accept': 'image/avif,image/webp,image/apng,*/*;q=0.8' } }, (res) => {
    let len = 0;
    res.on('data', chunk => len += chunk.length);
    res.on('end', () => {
      console.log(`w=${w}, q=${q}: status=${res.statusCode}, contentType=${res.headers['content-type']}, bytes=${len} (${(len/1024).toFixed(1)} KiB)`);
    });
  });
}

[640, 750].forEach(w => {
  [65, 70, 75].forEach(q => checkImg(w, q));
});
