# JavaScript Modules Tutorial

Requires Node.js 20 or newer.

```sh
npm ci
npm start
```

Open http://localhost:3000. The editor and all lesson assets are served locally.
Select a lesson, edit its files, click **Run Code**, then **Verify Solution**.
Buttons created by lesson code appear in the preview above the console.
**Reset Files** restores every starter file for the current lesson.

To change the port in PowerShell: `$env:PORT=3002; npm start`.

Browser checks:

```sh
npx playwright install chromium
npm test
```

The local development server stores the latest 100 runs in memory. Restarting it
clears those runs; click Run Code again to recreate the preview. This server is
intended for local use.
