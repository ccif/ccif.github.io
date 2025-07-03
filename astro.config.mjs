import { defineConfig, fontProviders } from 'astro/config';
import { exec } from 'child_process';
import tailwindcss from '@tailwindcss/vite';
import compress from 'astro-compress';
import icon from 'astro-icon';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://ccif.github.io',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    plugins: [
      tailwindcss(),
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
  },
  experimental: {
    fonts: [{
      name: 'Source Sans 3',
      cssVariable: '--font-source-sans-3',
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
    }, {
      name: 'Source Serif 4',
      cssVariable: '--font-source-serif-4',
      provider: fontProviders.fontsource(),
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
    }, {
      name: 'Inter',
      cssVariable: '--font-inter',
      provider: fontProviders.fontsource(),
      weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      styles: ['normal'],
      subsets: ['latin'],
    }],
  },
  integrations: [
    compress(),   // Post-processing
    icon(),       // Lightweight injection
    svelte(),     // Enables Svelte components
    mdx()         // MDX should go last unless another plugin needs to modify MDX behavior directly
  ]
});