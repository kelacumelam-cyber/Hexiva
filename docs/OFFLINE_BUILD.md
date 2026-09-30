# Offline / APK Web Build

This build path prepares Hexiva's web layer for packaging without runtime CDN dependencies.

## Requirements

- Node.js 20+ recommended
- npm

## Build

```bash
npm install
npm run build:web
```

Output:

```text
dist/
  index.html
  app.css
  vendor/
    three.min.js
    tween.umd.js
    Tone.js
```

The build:
- compiles Tailwind locally,
- copies pinned Three.js, Tween.js and Tone.js files from `node_modules`,
- rewrites CDN script references to local files,
- removes the Google Fonts request from the offline output.

The live GitHub Pages source remains `index.html`; `dist/` is intentionally ignored and is a generated packaging artifact.

Release cleanup still pending:
- remove/disable temporary QA coin grant,
- remove/disable desktop A/S shortcuts,
- choose Android wrapper and enforce portrait at native level,
- perform physical-device long-session test.
