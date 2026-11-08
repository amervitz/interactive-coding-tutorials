# Interactive Coding Tutorials

[**Open the tutorials →**](https://amervitz.github.io/interactive-coding-tutorials/)

Requires Node.js 24 or newer and the .NET 10 SDK selected by `global.json`.
Local development and GitHub Pages builds use
Node.js 24, recorded in `.nvmrc`. If you use nvm, run `nvm install 24` and `nvm use 24`
before installing dependencies.

```sh
npm ci
dotnet workload install wasm-tools
npm run build:csharp
npm start
```

Open http://localhost:3000 and choose a tutorial. The editor, lessons, and language
dependencies are served locally. Select a lesson, edit its files, click **Run Code**,
then **Verify Solution**.
Buttons created by lesson code appear in the preview above the console.
**Reset Files** restores every starter file for the current lesson.

To change the port in PowerShell: `$env:PORT=3002; npm start`.

Browser checks:

```sh
npx playwright install chromium
npm test
```

Lesson code runs entirely in the browser. JavaScript runs in a fresh sandboxed
preview; C# compiles and runs in a fresh Web Worker. Closing or rerunning a
session discards its files and program state. Edits are not saved across reloads.
The local development server only serves static files.

## Browser-only C# course

The home page lists the JavaScript Modules tutorial and C# Fundamentals,
a ten-lesson course. It loads only HTML and CSS. The JavaScript tutorial does not request
any C# assets. Opening `tutorials/index.html?lang=csharp` loads the C# lesson and editor, then starts
downloading the .NET WebAssembly runtime, Roslyn compiler, and embedded SDK
reference assemblies. No compiler runs on a server and no source code is uploaded.
The initial C# assets total approximately 40 MB before HTTP
compression, excluding the shared editor. The .NET libraries are deliberately
untrimmed so programs compiled at runtime can use them; reducing the download
would be a separate optimization step.

The C# runner supports multiple `.cs` files, C# 13 console programs, standard
library references, async entry points, console output, and compiler diagnostics
with file names and line numbers.

Compilation progress, source file names, warnings, errors, and the timed result
appear in the **Compilation** terminal tab beside **Console Output**. Compiler
errors select that tab automatically; program output and runtime errors appear
in the console. **Clear** clears the selected tab; running or resetting clears
both tabs.

**Stop** terminates the worker, including an
infinite loop. Runs also have a 15-second limit and a 1,000-entry output limit.
Each run creates a new worker to discard static state and loaded user assemblies;
the browser can reuse cached runtime downloads. Startup has a separate 120-second
limit and loading failures can be retried using **Run Code**.

Browser execution does not provide NuGet restore, interactive console input,
filesystem/process access outside browser capabilities, or C# IntelliSense.
Monaco supplies syntax highlighting; Roslyn reports diagnostics after running.
Workers keep the UI responsive but share the site's origin; this is intended for
learners running their own code, not as a security boundary for hostile programs.

`npm run build:csharp` publishes the C# host and stages its static assets under
`runtimes/csharp/publish/`. Run it again after changing the host or worker. .NET
and the WebAssembly workload are build-time requirements only; visitors need
only a modern browser. The deployment workflow installs these build tools.

### Learning sequence

1. Your First C# Program — statements, strings, console output, and comments.
2. Variables and Types — arithmetic, decimals, and string interpolation.
3. Decisions and Conditions — comparisons and branching.
4. Loops and Arrays — iteration and accumulation.
5. Methods and Multiple Files — parameters, return values, and shared types.
6. Classes and Interfaces — instances, constructors, properties, and contracts.
7. Generic Collections — lists, dictionaries, and type parameters.
8. Records and LINQ — data records, lambdas, filtering, and ordering.
9. Async Methods and Exceptions — tasks, awaiting, and error recovery.
10. Project Files and Compiler Settings — an editable `.csproj` and a report capstone.

Every lesson has a runnable starter, an exercise, hints, and output checks.
The course starts with a single file and introduces additional files when needed.

### Browser project-file support

One editable SDK-style `.csproj` may accompany a lesson's `.cs` files; Monaco
edits it as XML. All `.cs` tabs compile together. The runner applies the following
unconditional `PropertyGroup` values directly to Roslyn:

| Property | Supported values |
| --- | --- |
| `TargetFramework` | `net10.0` |
| `OutputType` | `Exe` |
| `ImplicitUsings` | `enable`, `disable` |
| `Nullable` | `enable`, `disable` |
| `LangVersion` | `12.0`, `13.0` |
| `TreatWarningsAsErrors` | `true`, `false` |
| `DefineConstants` | Semicolon-separated C# identifiers |

Without a project file, the defaults remain C# 13 console execution with explicit
usings and nullable analysis disabled. Project settings default to those same
values when omitted. The framework remains the bundled .NET 10 runtime/reference
set; changing the XML cannot download another SDK or runtime.

This is a supported subset of project settings, not MSBuild in the browser.
Unsupported properties, attributes, conditions, item groups, imports, package or
project references, targets, malformed XML, and multiple projects produce errors.
XML DTDs are prohibited. Settings are re-read on every run. See Microsoft's
[SDK project properties](https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props)
for how these settings work in a full local SDK build.

## Static hosting

Run `npm run build` and publish the contents of `dist/` on a static HTTP(S) host.
The build includes local copies of the dependencies; Node.js and .NET are only
needed for development and building. Paths are relative, so hosting under a subdirectory
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
| `index.html` | Lists tutorials without loading editors or language runtimes. |
| `tutorials/index.html` | Shared tutorial page, selected with `?lang=js` or `?lang=csharp`. |
| `tutorials/languages.js` | Language titles, editor modes, UI capabilities, and lazy lesson/runner loaders. |
| `runtimes/js/runner.js` | Starts, stops, and supervises the JavaScript preview iframe. |
| `runtimes/csharp/runner.js` | Starts, stops, and supervises the C# Web Worker. |
| `runtimes/csharp/` | Builds the WebAssembly host, Roslyn compiler, reference assemblies, and worker. |
| `lessons/csharp/` | Contains the ten C# lessons in manifest order. |
| `runtimes/csharp/LessonProject.cs` | Validates supported project settings and creates Roslyn options. |
| `app.js` | Manages the editor, lesson navigation, run/reset buttons, console display, and verification results. |
| `styles.css` | Styles the main application and rendered lesson instructions. |
| `runtimes/js/sandbox.html` | Provides the document loaded inside the sandboxed preview iframe. |
| `runtimes/js/sandbox.js` | Receives edited lesson files, prepares in-memory modules, executes `main.js`, and sends output back to the controller. |
| `runtimes/js/preview.css` | Styles the preview document and buttons created by lesson code. |
| `runtimes/js/module-files.js` | Analyzes JavaScript imports, re-exports, and `import.meta`. |
| `lessons/js/index.json` | Lists lesson folders in display order. |
| `lessons/js/index.js` | Loads and exports the lesson collection. |
| `lessons/loader.js` | Fetches lesson files, validates YAML metadata, renders Markdown, and loads verification checks. |
| `scripts/build-site.js` | Builds shared assets and coordinates the language builders into a clean `dist/`. |
| `scripts/build-js.js` / `scripts/build-csharp.js` | Build and stage each language's lessons, runtime, and dependencies. |
| `scripts/build-assets.js` | Shared asset copying and dependency license handling. |
| `server.js` | Serves source files and dependency assets during local development. |
| `package.json` | Defines project dependencies, Node.js requirements, and start, build, and test commands. |
| `package-lock.json` | Records exact dependency versions for reproducible installs. |
| `playwright.config.js` | Configures browser tests and starts the development server for testing. |
| `tests/tutorial-js.spec.js` | Tests lesson exercises, module execution, sandbox isolation, error handling, and mobile layout. |
| `tests/lesson-loader.spec.js` | Tests metadata validation, Markdown rendering, and lesson loading errors. |
| `tests/static-host.spec.js` | Verifies the built site works under a subdirectory on a plain static file host. |

Each lesson folder contains `lesson.yaml` for metadata, `instructions.md` for
teaching content, `checks.js` for verification functions, and `starter/` for
editable example code. The generated `dist/` directory is the publishable site;
edit source files and rebuild to update it.

Language-specific content lives in matching `lessons/<language>/` and
`runtimes/<language>/` directories. Each runtime exposes a `runner.js` controller
with `run(files, log)` and `stop()` methods. `app.js`, styles, the catalog, and
`lessons/loader.js` are shared. Language identifiers in folder and build-script
names are `js` and `csharp`.

```text
tutorials/
  index.html                 # Shared page: ?lang=js or ?lang=csharp
  languages.js               # Language configuration and lazy loaders
lessons/
  loader.js                  # Shared Markdown/YAML loader
  js/                        # JavaScript manifest and lessons
  csharp/                    # C# manifest and lessons
runtimes/
  js/
    runner.js                # JavaScript execution controller
    sandbox.html
    sandbox.js
    module-files.js
    preview.css
  csharp/
    runner.js                # C# execution controller
    worker.js
    Program.cs
    LessonProject.cs
    CSharpRunner.csproj
    publish/                 # Generated browser runtime assets (ignored)
scripts/
  build-site.js              # Shared build coordinator
  build-assets.js            # Shared copy utilities
  build-js.js
  build-csharp.js
```

`npm run build` cleans and rebuilds the complete site. `npm run build:js` and
`npm run build:csharp` refresh that language's assets in `dist/` without cleaning
other assets. The C# command also regenerates `runtimes/csharp/publish/` for the
development server. Use the full build before publishing. Local JavaScript
execution serves source files and needs no language build step.

The shared tutorial page defaults to JavaScript when `lang` is omitted and
reports an error for unknown languages without loading a runner. Configuration
controls the title, editor mode, preview, compilation tab, Stop button, and runtime
status. Only the selected configuration's lesson and runner loaders are invoked.

To add a language, create matching lesson/runtime folders, implement its runner,
add its `build-<language>.js` builder to `build-site.js`, register its settings in
`tutorials/languages.js`, and update the catalog, loader validation, and development
server routes. The tutorial HTML is shared across all languages.

C# lessons live under `lessons/csharp/` and use the same format, with
`language: csharp`, `entryFile: Program.cs`, and `.cs` starter files in YAML.
Include a `.csproj` in the starter file list when teaching project configuration.
Their `checks.js` functions can inspect captured console output just like the
JavaScript checks. Omitting language metadata retains the existing JavaScript
defaults (`javascript` and `main.js`).

## Adding or editing lessons

Lessons are separate from the application code:

```text
lessons/js/
  index.json                 # Lesson folder names, in display order
  index.js                   # Browser loader
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
folder name to `lessons/js/index.json`. The manifest determines lesson order.
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

JavaScript execution uses native import maps and blob URLs inside the sandbox.
ES Module Lexer identifies imports so relative paths and computed dynamic
imports can resolve to the edited files in memory. The native browser module
loader preserves live bindings, module identity, and circular imports.
There are no API endpoints, service workers, or server-side run storage.

Run `npm test` after editing lessons. Extend the browser exercises when adding
new lessons.
