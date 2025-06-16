mkdir -p assets
pandoc resume/resume.md -o assets/resume.pdf --template=resume/template.pandoc.tex --standalone --variable date="$(date '+%B %d, %Y')"
pandoc resume/resume.md -o resume/index.html --template=resume/template.pandoc.html --standalone --variable date="$(date '+%B %d, %Y')"