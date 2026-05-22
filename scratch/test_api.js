const http = require('http');

async function testApi() {
  // Let's sign in to get a token
  const payload = JSON.stringify({ email: 'demo@habitai.com', password: 'password123' });
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const { token } = JSON.parse(data);
        console.log('Token acquired:', token);
        
        // Fetch metrics
        const req2 = http.request({
          hostname: 'localhost',
          port: 5000,
          path: '/api/analytics/metrics',
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }, (res2) => {
          let data2 = '';
          res2.on('data', chunk => data2 += chunk);
          res2.on('end', () => {
            console.log('Metrics API response first item:', JSON.parse(data2)[0]);
            process.exit(0);
          });
        });
        req2.end();
      } catch (err) {
        console.error('Failed to parse login response:', err);
        process.exit(1);
      }
    });
  });
  req.write(payload);
  req.end();
}

testApi();
