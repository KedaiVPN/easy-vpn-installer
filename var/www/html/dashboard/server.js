
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create basic HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle API routes
  if (req.url.startsWith('/api/status')) {
    // Return system status
    try {
      const statusFile = path.join(__dirname, 'status.json');
      if (fs.existsSync(statusFile)) {
        const data = fs.readFileSync(statusFile, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Status file not found' }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  } 
  else if (req.url.startsWith('/api/accounts')) {
    // List accounts
    exec('cat /etc/passwd | grep -v "nologin" | grep -v "false" | cut -d: -f1', (error, stdout, stderr) => {
      if (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      
      const accounts = stdout.split('\n')
        .filter(Boolean)
        .filter(account => !['root', 'sync', 'games', 'man', 'lp', 'mail', 'news', 'uucp', 'proxy', 'www-data', 'backup', 'list', 'irc', 'gnats', 'nobody', 'systemd-network', 'systemd-resolve', 'systemd-timesync', 'messagebus', 'syslog', '_apt', 'tss', 'uuidd', 'tcpdump', 'landscape', 'pollinate', 'sshd', 'systemd-coredump'].includes(account))
        .map(account => {
          return { username: account, type: 'ssh' };
        });
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ accounts }));
    });
  }
  else if (req.url.startsWith('/api/services')) {
    // Check services status
    const services = ['ssh', 'nginx', 'xray'];
    const statusPromises = services.map(service => {
      return new Promise((resolve) => {
        exec(`systemctl is-active ${service}`, (error, stdout) => {
          resolve({ 
            name: service, 
            status: stdout.trim() === 'active' 
          });
        });
      });
    });
    
    Promise.all(statusPromises)
      .then(results => {
        const statusObj = {};
        results.forEach(result => {
          statusObj[result.name] = result.status;
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(statusObj));
      })
      .catch(error => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
      });
  }
  else if (req.url.startsWith('/api/system')) {
    // Get system information
    exec('free -m | awk \'/Mem:/ {print $2 ":" $3 ":" $4}\'', (error, memOutput) => {
      if (error) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      
      const [totalMem, usedMem, freeMem] = memOutput.trim().split(':');
      
      exec('uptime -p', (error, uptimeOutput) => {
        if (error) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: error.message }));
          return;
        }
        
        exec('df -h / | awk \'NR==2 {print $2 ":" $3 ":" $4 ":" $5}\'', (error, diskOutput) => {
          if (error) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: error.message }));
            return;
          }
          
          const [totalDisk, usedDisk, freeDisk, diskUsage] = diskOutput.trim().split(':');
          
          const systemInfo = {
            memory: {
              total: `${totalMem} MB`,
              used: `${usedMem} MB`,
              free: `${freeMem} MB`
            },
            uptime: uptimeOutput.trim(),
            disk: {
              total: totalDisk,
              used: usedDisk,
              free: freeDisk,
              usage: diskUsage
            }
          };
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(systemInfo));
        });
      });
    });
  }
  else {
    // Serve static dashboard files
    let filePath = path.join(__dirname, req.url === '/' || req.url === '/dashboard' ? 'index.html' : req.url);
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
    
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
    }
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      } else {
        // Create a simple default page if no index.html
        if (req.url === '/' || req.url === '/dashboard') {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>VPN Dashboard</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f0f0f0; }
                .container { max-width: 1200px; margin: 0 auto; padding: 20px; background: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; }
                .card { background: #f9f9f9; padding: 15px; margin-bottom: 15px; border-radius: 5px; border-left: 4px solid #2d8ac7; }
                .status { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 5px; }
                .status.active { background: #4CAF50; }
                .status.inactive { background: #F44336; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>VPN Dashboard</h1>
                <div class="card">
                  <h2>Status Server</h2>
                  <p><span class="status active"></span> Server aktif dan berjalan normal.</p>
                  <p>Uptime: <span id="uptime">Loading...</span></p>
                </div>
                <div class="card">
                  <h2>Service Status</h2>
                  <div id="services">Loading...</div>
                </div>
              </div>
              <script>
                // Simple script to fetch data from the API
                fetch('/api/system')
                  .then(response => response.json())
                  .then(data => {
                    document.getElementById('uptime').textContent = data.uptime;
                  })
                  .catch(error => console.error('Error fetching system info:', error));
                
                fetch('/api/services')
                  .then(response => response.json())
                  .then(data => {
                    const servicesDiv = document.getElementById('services');
                    servicesDiv.innerHTML = '';
                    
                    Object.entries(data).forEach(([service, isActive]) => {
                      const statusClass = isActive ? 'active' : 'inactive';
                      const statusText = isActive ? 'Active' : 'Inactive';
                      servicesDiv.innerHTML += `<p><span class="status ${statusClass}"></span> ${service.toUpperCase()}: ${statusText}</p>`;
                    });
                  })
                  .catch(error => console.error('Error fetching services:', error));
              </script>
            </body>
            </html>
          `);
        } else {
          res.writeHead(404);
          res.end('File not found');
        }
      }
    } catch (error) {
      res.writeHead(500);
      res.end(`Server Error: ${error.message}`);
    }
  }
});

// Create initial status.json if it doesn't exist
if (!fs.existsSync(path.join(__dirname, 'status.json'))) {
  const initialStatus = {
    systemInfo: {
      ram: "Calculating...",
      uptime: "Calculating...",
      bandwidth: "Calculating..."
    },
    services: {
      ssh: false,
      nginx: false,
      xray: false
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'status.json'),
    JSON.stringify(initialStatus, null, 2)
  );
}

// Start server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Dashboard API available at http://localhost:${PORT}/api/`);
});
