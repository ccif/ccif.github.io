import { defineConfig } from 'astro/config';
import fs from 'fs';
import { exec } from 'child_process';

export default defineConfig({
  vite: {
    plugins: [
      {
        name: 'pandoc-resume-watcher',
        configureServer(server) {
          const targetFile = 'src/content/resume/resume.md';

          server.watcher.on('change', (file) => {
            if (file.endsWith(targetFile)) {
              console.log('📝 resume.md changed — regenerating resume.pdf...');
              exec('bash scripts/build-pdf-resume.sh', (err, stdout, stderr) => {
                if (err) {
                  console.error('🚨 Pandoc error:\n', stderr);
                } else {
                  console.log('✅ Resume PDF built:\n', stdout);
                }
              });
            }
          });
        }
      }
    ]
  }
});
