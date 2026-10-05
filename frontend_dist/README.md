# Compiled Frontend Distribution

This directory contains the production-compiled frontend assets generated from Vite:
- `index.html`: Entry point for the single-page application
- `assets/`: Minified JavaScript bundles and compiled CSS stylesheets

## Serving the Production Build
To serve this production build locally or on a static web server:
```bash
npx serve frontend_dist
```
or with Python:
```bash
python3 -m http.server 3000 --directory frontend_dist
```
