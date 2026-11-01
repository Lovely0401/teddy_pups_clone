import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(get(res.headers.location));
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    }).on('error', reject);
  });
}

function downloadBinary(url, destPath) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve({ cached: true, size: fs.statSync(destPath).size });
    }

    const file = fs.createWriteStream(destPath);
    const req = https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return resolve(downloadBinary(res.headers.location, destPath));
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        return resolve({ statusCode: res.statusCode, error: true });
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          resolve({ success: true, size: fs.statSync(destPath).size });
        });
      });
    });

    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

const mediaUrls = new Set();

// 1. Scan repo
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.git' || entry.name === 'scripts') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (['.ts', '.tsx', '.js', '.jsx', '.html', '.json'].some(e => entry.name.endsWith(e))) {
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/\/media\/[a-zA-Z0-9_\-\.\/]+/g);
      if (matches) {
        for (const m of matches) {
          const cleaned = m.replace(/["'\)\,\s\\].*$/, '');
          mediaUrls.add(cleaned);
        }
      }
    }
  }
}

walk('.');
console.log(`Scanned repo: found ${mediaUrls.size} media references`);

// 2. Extract puppy slugs from src/data/puppies.ts
const puppiesCode = fs.readFileSync('src/data/puppies.ts', 'utf8');
const slugMatches = Array.from(puppiesCode.matchAll(/"slug":\s*"([^"]+)"/g)).map(m => m[1]);
console.log(`Found ${slugMatches.length} puppy slugs`);

async function run() {
  const routes = ['', '/puppies', '/how-it-works', '/faq', '/contact', ...slugMatches.map(s => `/puppies/${s}`)];
  console.log(`Checking ${routes.length} routes on puppy.instabizweb.com...`);

  // Crawl in batches of 5
  for (let i = 0; i < routes.length; i += 5) {
    const batch = routes.slice(i, i + 5);
    await Promise.all(batch.map(async (route) => {
      try {
        const res = await get(`https://puppy.instabizweb.com${route}`);
        if (res.statusCode === 200) {
          const matches = res.data.match(/\/media\/[a-zA-Z0-9_\-\.\/]+/g) || [];
          for (const m of matches) {
            const cleaned = m.replace(/["'\)\,\s\\].*$/, '');
            mediaUrls.add(cleaned);
          }
        }
      } catch (err) {
        // ignore crawl errors for optional pages
      }
    }));
  }

  console.log(`Total unique media to download: ${mediaUrls.size}`);

  const list = Array.from(mediaUrls);
  let downloaded = 0;
  let cached = 0;
  let failed = 0;

  // Download in concurrent pools of 8
  const concurrency = 8;
  for (let i = 0; i < list.length; i += concurrency) {
    const batch = list.slice(i, i + concurrency);
    await Promise.all(batch.map(async (mediaPath) => {
      const targetPath = path.join('public', mediaPath);
      const remoteUrl = `https://puppy.instabizweb.com${mediaPath}`;
      try {
        const res = await downloadBinary(remoteUrl, targetPath);
        if (res.cached) {
          cached++;
        } else if (res.success) {
          downloaded++;
        } else {
          console.warn(`Failed: ${mediaPath} -> Status ${res.statusCode}`);
          failed++;
        }
      } catch (err) {
        console.error(`Error downloading ${mediaPath}: ${err.message}`);
        failed++;
      }
    }));
    process.stdout.write(`\rProgress: ${i + batch.length}/${list.length} (downloaded: ${downloaded}, cached: ${cached}, failed: ${failed})`);
  }

  console.log(`\nFinished! Downloaded: ${downloaded}, Cached: ${cached}, Failed: ${failed}`);
}

run();

