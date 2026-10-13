#!/bin/sh
# Rebuilds the site: game modules -> src/operacion-insurgentes.html -> index.html and manifest.webmanifest at the repo root.
set -e
cd "$(dirname "$0")"
sh src/build.sh
python3 web/build.py
