# JavaScript Modules Tutorial

Requires Node.js 24 or newer. Local development and GitHub Pages builds use
Node.js 24, recorded in `.nvmrc`. If you use nvm, run `nvm install 24` and `nvm use 24`
before installing dependencies.

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

Lesson code runs entirely in the browser. Each run opens a fresh sandboxed
preview and passes the edited files to it in memory. Closing or rerunning the
preview discards its files and module state. Edits are not saved across reloads.
The local development server only serves static files.

## Static hosting

Run `npm run build` and publish the contents of `dist/` on a static HTTP(S) host.
The build includes local copies of the dependencies; Node.js is only needed for
development and building. Paths are relative, so hosting under a subdirectory
is supported. Open the site in a modern browser with native import-map support
over HTTP(S), rather than as a `file://` URL. `npm test` builds the static site
and verifies it using a plain file host as well as the development server.

### GitHub Pages

The `Deploy GitHub Pages` workflow builds and publishes `dist/` only when run
manually. Pushes do not trigger a deployment, and `dist/` stays out of Git.

1. Commit and push `.github/workflows/deploy-pages.yml` to `main` so GitHub
   displays the manual workflow controls.
2. In the repository's **Settings → Pages → Build and deployment**, select
   **GitHub Actions** as the source. This is a one-time setup step.
3. Open **Actions → Deploy GitHub Pages → Run workflow**, select `main`, and
   click **Run workflow**.

After the workflow succeeds, the site is available at
https://amervitz.github.io/interactive-coding-tutorials/ . The deployment job
also displays the published URL. Repeat step 3 whenever you want to publish
an update.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Defines the main application page and loads its assets. |
| `app.js` | Manages the editor, lesson navigation, run/reset buttons, console display, and verification results. |
| `styles.css` | Styles the main application and rendered lesson instructions. |
| `runner.html` | Provides the document loaded inside the sandboxed preview iframe and loads its stylesheet and JavaScript. |
| `runner.js` | Receives edited lesson files, prepares in-memory modules, executes `main.js`, and sends console output and errors back to the app. |
| `preview.css` | Styles the preview document and buttons created by lesson code. |
| `module-files.js` | Analyzes JavaScript to locate imports, re-exports, and `import.meta`, supplying their locations to `runner.js`. |
| `lessons/index.json` | Lists lesson folders in display order. |
| `lessons/index.js` | Loads and exports the lesson collection. |
| `lessons/loader.js` | Fetches lesson files, validates YAML metadata, renders Markdown, and loads verification checks. |
| `scripts/build.js` | Copies application files, lessons, and dependencies into `dist/` for static hosting. |
| `server.js` | Serves source files and dependency assets during local development. |
| `package.json` | Defines project dependencies, Node.js requirements, and start, build, and test commands. |
| `package-lock.json` | Records exact dependency versions for reproducible installs. |
| `playwright.config.js` | Configures browser tests and starts the development server for testing. |
| `tests/tutorial.spec.js` | Tests lesson exercises, module execution, sandbox isolation, error handling, and mobile layout. |
| `tests/lesson-loader.spec.js` | Tests metadata validation, Markdown rendering, and lesson loading errors. |
| `tests/static-host.spec.js` | Verifies the built site works under a subdirectory on a plain static file host. |

Each lesson folder contains `lesson.yaml` for metadata, `instructions.md` for
teaching content, `checks.js` for verification functions, and `starter/` for
editable example code. The generated `dist/` directory is the publishable site;
edit source files and rebuild to update it.

## Adding or editing lessons

Lessons are separate from the application code:

```text
lessons/
  index.json                 # Lesson folder names, in display order
  index.js                   # Browser loader
  loader.js                  # Fetches and validates lesson files
  named-exports/
    lesson.yaml              # ID, title, and starter file list
    instructions.md          # Markdown lesson text and exercise
    checks.js                # Verification functions
    starter/
      main.js
      utils.js
```

For example, `named-exports/lesson.yaml` contains:

```yaml
id: 2
title: Named Exports
files:
  - utils.js
  - main.js
```

To add a lesson, copy a lesson folder, assign a unique positive ID, and add its
folder name to `lessons/index.json`. The manifest determines lesson order.
List every starter file in the YAML, including `main.js`; nested paths such as
`shapes/circle.js` are supported. Starter files are read as text, not executed
on the server, and are only executed in the preview when the learner runs them.

Write instructions in Markdown, using fenced code blocks with a language such
as `javascript` or `html`. Write literal `<script>` tags inside code fences;
there is no need to HTML-encode them. Raw HTML outside code fences is displayed
as text.

Start the exercise with `### 🎯 Exercise: Your exercise title`. This heading and
the following content appear in the exercise panel. Use blockquotes (`>`) for
hints. The app creates a separate verification results container, so no HTML
classes or result placeholders are needed in lesson files.

`checks.js` exports a default array of objects with a `name` and a
`test(output)` function returning a boolean. Output entries have `text` and
`type` fields. Checks remain JavaScript functions rather than strings in YAML.

The browser's `lessons/loader.js` fetches the manifest and lesson files, validates
YAML metadata, renders Markdown, and loads verification functions. YAML and
Markdown parsers are served locally from the installed dependencies under
`/vendor/`; lesson loading uses static files and needs no API endpoint.
Content edits are picked up when the page reloads. Invalid metadata or missing
files produce a lesson loading error in the console.

Code execution uses native import maps and blob URLs inside the sandbox.
ES Module Lexer identifies imports so relative paths and computed dynamic
imports can resolve to the edited files in memory. The native browser module
loader preserves live bindings, module identity, and circular imports.
There are no API endpoints, service workers, or server-side run storage.

Run `npm test` after editing lessons. Extend the browser exercises when adding
new lessons.
