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


## Android wrapper

Hexiva uses Capacitor 8.5.2 for the Android wrapper.

Initial local setup:

```bash
npm install
npm run android:add
npm run android:open
```

After web changes:

```bash
npm run android:sync
```

`android:add` and `android:sync` both:
1. build the offline `dist/` bundle,
2. copy/sync it into the Capacitor Android project,
3. enforce `android:screenOrientation="portrait"` on `.MainActivity`.

The current test application id is:

```text
com.hexiva.game
```

Treat that ID as provisional until store publishing. Once an app is published under a package/application ID, changing identity requires a new store listing.
