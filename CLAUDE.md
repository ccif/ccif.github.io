# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Astro, featuring a blog, resume, and mathematical content support via KaTeX. The site is designed as a minimalist showcase with resume PDF auto-generation capabilities.

## Common Development Commands

### Development Server
```bash
bun dev
```

### Build Commands
```bash
bun run build         # Build the Astro site
bun run preview       # Preview the built site
```

### Resume PDF Generation
```bash
bash scripts/build-pdf-resume.sh
```
- Requires `pandoc` and `texlive-full` to be installed
- Automatically rebuilds PDF when `src/content/resume/resume.md` changes during development
- Template located at `templates/resume.pandoc.tex`

## Architecture

### Core Technologies
- **Astro**: Static site generator with hybrid SSG/SPA capabilities
- **Bun**: JavaScript runtime and package manager
- **Tailwind CSS v4**: Utility-first CSS framework with DaisyUI components
- **Svelte**: Component framework for interactive elements
- **MDX**: Markdown with JSX support for rich content
- **KaTeX**: Mathematical notation rendering
- **D3.js**: Data visualization library

### Content Management
- **Astro Content Collections**: Type-safe content management system
- Resume data stored in `src/content/resume/resume.md` with structured YAML frontmatter
- Content schema defined in `src/content/config.ts`

### Key Directory Structure
```
src/
├── assets/           # Global CSS and static assets
├── components/       # Reusable Astro components
├── content/          # Content collections (resume, blog posts)
├── layouts/          # Page layouts
└── pages/            # File-based routing
```

### Font Management
- Uses Astro's experimental font optimization with Fontsource
- Three primary fonts: Inter (headings), Source Sans 3 (body), Source Serif 4 (content)
- CSS variables: `--font-inter`, `--font-source-sans-3`, `--font-source-serif-4`

### Path Aliases
- `@components/*` → `src/components/*`
- `@layouts/*` → `src/layouts/*`
- `@assets/*` → `src/assets/*`

## Development Workflow

### Resume Updates
- Edit `src/content/resume/resume.md`
- PDF automatically regenerates during development
- Manual generation: `bash scripts/build-pdf-resume.sh`

### Mathematical Content
- Use KaTeX syntax in MDX files
- Supported via `remark-math` and `rehype-katex` plugins
- Example: `/test-katex` page demonstrates usage

### Blog Development
- Blog posts go in `src/pages/blog/`
- Support for both `.astro` and `.mdx` formats
- Can include interactive Svelte components

## Key Components

### Resume Component (`src/components/resume.astro`)
- Renders resume data from content collection
- Timeline-based UI using DaisyUI components
- Includes PDF download functionality

### Layout (`src/layouts/layout.astro`)
- Base HTML structure with font preloading
- Includes Google Analytics integration
- KaTeX CSS loaded from CDN

## Technical Notes

### Build Process
- Static site generation with optional hybrid rendering
- Compression enabled via `astro-compress`
- Icon optimization via `astro-icon`

### Development Server Features
- Hot reloading for all content
- Automatic PDF regeneration on resume changes
- Integrated with Astro's development server

### Dependencies
- Runtime: Bun-based development environment
- Build: Astro with Vite underneath
- Styling: Tailwind CSS v4 with DaisyUI components
- Icons: Iconify with Solar and Streamline logo sets