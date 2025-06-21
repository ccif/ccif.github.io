#!/bin/bash
set -e

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MD_PATH="$PROJECT_ROOT/src/content/resume/resume.md"
PDF_OUT="$PROJECT_ROOT/public/resume.pdf"
TEMPLATE="$PROJECT_ROOT/templates/resume.pandoc.tex"

# Basic PDF build with LaTeX
pandoc "$MD_PATH" -o "$PDF_OUT" \
  --from markdown+yaml_metadata_block \
  --template="$TEMPLATE" \
  --standalone

echo "✅ Resume PDF built at $PDF_OUT"
