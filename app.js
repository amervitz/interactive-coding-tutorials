
    const LESSONS = [
      {
        id: 1,
        title: "What are Modules?",
        files: {
          "main.js": `// Modules are reusable pieces of code
// They run in strict mode by default
// Each module has its own scope

console.log("📦 Module loaded: main.js");

// Try importing from utils.js (will fail until you create it)
// import { greet } from './utils.js';

// greet("World");`
        },
        content: `
          <h2>What are JavaScript Modules?</h2>
          <p>Modules let you split your code into separate files, each with its own scope. Variables and functions declared in a module are <strong>private by default</strong> — they don't pollute the global scope.</p>
          <p>Key characteristics:</p>
          <ul style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--muted); line-height: 1.8;">
            <li>Run in <code>strict mode</code> automatically</li>
            <li>Have their own top-level scope (no global pollution)</li>
            <li>Load asynchronously (non-blocking)</li>
            <li>Use <code>import</code>/<code>export</code> syntax</li>
            <li>Are singletons — same module imported multiple times shares one instance</li>
          </ul>
          <p>To use modules in the browser, add <code>type="module"</code> to your script tag:</p>
          <pre><code>&lt;script type="module" src="main.js"&gt;&lt;/script&gt;</code></pre>
          <div class="exercise">
            <h3>🎯 Exercise: Explore the Module Scope</h3>
            <p>Notice that <code>main.js</code> runs automatically. Check the console output — it shows "Module loaded: main.js".</p>
            <p>Try uncommenting the import line (it will fail because <code>utils.js</code> doesn't exist yet).</p>
            <p class="hint">💡 Modules are loaded via HTTP — you need a local server (like <code>npx serve</code> or VS Code Live Server) for imports to work in the browser.</p>
          </div>
        `,
        verification: [
          { name: "Module executes without errors", test: (output) => !output.some(l => l.type === 'error') }
        ]
      },
      {
        id: 2,
        title: "Named Exports",
        files: {
          "utils.js": `// Named exports - export multiple values
export const PI = 3.14159;
export const E = 2.71828;

export function circleArea(radius) {
  return PI * radius * radius;
}

export function circleCircumference(radius) {
  return 2 * PI * radius;
}

// Can also export all at once:
// export { PI, E, circleArea, circleCircumference };`,
          "main.js": `import { PI, circleArea, circleCircumference } from './utils.js';

console.log("📐 Circle Calculations");
console.log("PI =", PI);
console.log("Area (r=5):", circleArea(5));
console.log("Circumference (r=5):", circleCircumference(5));

// TODO: Import E and log it
// import { E } from './utils.js';
// console.log("E =", E);`
        },
        content: `
          <h2>Named Exports</h2>
          <p>Named exports let you export multiple values from a module. You can export declarations individually or group them.</p>
          <pre><code>// Individual exports
export const PI = 3.14159;
export function circleArea(r) { return PI * r * r; }

// Or grouped export
export { PI, E, circleArea, circleCircumference };</code></pre>
          <p>When importing, use curly braces with the exact names:</p>
          <pre><code>import { PI, circleArea } from './utils.js';
import { E as eulerNumber } from './utils.js'; // rename with 'as'</code></pre>
          <div class="exercise">
            <h3>🎯 Exercise: Use Named Exports</h3>
            <p>Uncomment the import for <code>E</code> in <code>main.js</code> and log its value.</p>
            <p>Then run the code and verify the output shows both PI and E constants.</p>
            <p class="hint">💡 You can import multiple named exports in one line: <code>import { PI, E, circleArea } from './utils.js';</code></p>
          </div>
        `,
        verification: [
          { name: "PI constant imported and logged", test: (output) => output.some(l => l.text.includes('PI =') && l.text.includes('3.14')) },
          { name: "E constant imported and logged", test: (output) => output.some(l => l.text.includes('E =') && l.text.includes('2.71')) },
          { name: "circleArea function works", test: (output) => output.some(l => l.text.includes('Area (r=5):') && l.text.includes('78.5')) },
          { name: "circleCircumference function works", test: (output) => output.some(l => l.text.includes('Circumference (r=5):') && l.text.includes('31.4')) }
        ]
      },
      {
        id: 3,
        title: "Default Exports",
        files: {
          "math.js": `// Default export - one per module
const Calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => b !== 0 ? a / b : 'Error: Division by zero'
};

export default Calculator;

// Can also export default inline:
// export default class Calculator { ... }
// export default function() { ... }`,
          "main.js": `import Calculator from './math.js';
// Note: no curly braces for default import!
// Can name it anything: import Calc from './math.js';

console.log("🧮 Calculator Demo");
console.log("5 + 3 =", Calculator.add(5, 3));
console.log("10 - 4 =", Calculator.subtract(10, 4));
console.log("6 * 7 =", Calculator.multiply(6, 7));
console.log("20 / 4 =", Calculator.divide(20, 4));
console.log("5 / 0 =", Calculator.divide(5, 0));

// TODO: Try importing with a different name
// import Calc from './math.js';
// console.log("Renamed import:", Calc.add(1, 2));`
        },
        content: `
          <h2>Default Exports</h2>
          <p>A module can have <strong>one default export</strong>. It's imported without curly braces and can be renamed freely.</p>
          <pre><code>// Export
export default function greet(name) { return \`Hello, \${name}!\`; }
export default class User { ... }
export default { PI: 3.14, E: 2.71 };</code></pre>
          <pre><code>// Import - no braces, any name
import greet from './greet.js';
import MyGreeting from './greet.js';
import defaultExport from './greet.js';</code></pre>
          <p>You can combine default and named imports:</p>
          <pre><code>import Calculator, { PI, E } from './math.js';</code></pre>
          <div class="exercise">
            <h3>🎯 Exercise: Rename the Default Import</h3>
            <p>Uncomment the renamed import (<code>import Calc from './math.js'</code>) and use it to call <code>add(1, 2)</code>.</p>
            <p>Verify both the original <code>Calculator</code> and renamed <code>Calc</code> work.</p>
            <p class="hint">💡 Default exports are great for "main" functionality of a module. Named exports are better for utilities and constants.</p>
          </div>
        `,
        verification: [
          { name: "Default import works", test: (output) => output.some(l => l.text.includes('5 + 3 =') && l.text.includes('8')) },
          { name: "All calculator methods work", test: (output) => output.some(l => l.text.includes('10 - 4 =') && l.text.includes('6')) && output.some(l => l.text.includes('6 * 7 =') && l.text.includes('42')) && output.some(l => l.text.includes('20 / 4 =') && l.text.includes('5')) },
          { name: "Division by zero handled", test: (output) => output.some(l => l.text.includes('5 / 0 =') && l.text.includes('Error')) },
          { name: "Renamed import works", test: (output) => output.some(l => l.text.includes('Renamed import:') && l.text.includes('3')) }
        ]
      },
      {
        id: 4,
        title: "Re-exporting",
        files: {
          "shapes/circle.js": `export const PI = 3.14159;
export function area(r) { return PI * r * r; }
export function circumference(r) { return 2 * PI * r; }`,
          "shapes/rectangle.js": `export function area(w, h) { return w * h; }
export function perimeter(w, h) { return 2 * (w + h); }`,
          "shapes/index.js": `// Re-export all from circle.js
export { PI, area as circleArea, circumference } from './circle.js';
export { area as rectArea, perimeter } from './rectangle.js';

// Can also re-export with renaming:
// export { area as circleArea } from './circle.js';
// export { area as rectArea } from './rectangle.js';`,
          "main.js": `// Single import from barrel file!
import { PI, circleArea, circumference } from './shapes/index.js';

console.log("📦 Barrel Export Demo");
console.log("PI =", PI);
console.log("Circle area (r=3):", circleArea(3));
console.log("Circle circumference (r=3):", circumference(3));

// TODO: Import rectangle functions
// import { rectArea, perimeter } from './shapes/index.js';
// console.log("Rect area (4x5):", rectArea(4, 5));
// console.log("Rect perimeter (4x5):", perimeter(4, 5));`
        },
        content: `
          <h2>Re-exporting (Barrel Files)</h2>
          <p>Re-exporting lets you create a single entry point ("barrel file") that aggregates exports from multiple modules. This simplifies imports for consumers.</p>
          <pre><code>// shapes/index.js
export { PI, area as circleArea, circumference } from './circle.js';
export { area as rectArea, perimeter } from './rectangle.js';
export { default as Triangle } from './triangle.js';</code></pre>
          <p>Now consumers import from one place:</p>
          <pre><code>import { PI, circleArea, circumference, rectArea, perimeter } from './shapes/index.js';</code></pre>
          <p>You can also rename during re-export to avoid conflicts:</p>
          <pre><code>export { area as circleArea } from './circle.js';
export { area as rectArea } from './rectangle.js';</code></pre>
          <div class="exercise">
            <h3>🎯 Exercise: Use Rectangle Functions</h3>
            <p>Uncomment the rectangle imports in <code>main.js</code> and log the area and perimeter of a 4×5 rectangle.</p>
            <p>Notice how <code>shapes/index.js</code> gives both area functions distinct names — you don't need to know the internal file structure!</p>
            <p class="hint">💡 Both modules export <code>area</code>. The barrel renames them to <code>circleArea</code> and <code>rectArea</code> so consumers can import each one unambiguously.</p>
          </div>
        `,
        verification: [
          { name: "Circle functions work", test: (output) => output.some(l => l.text.includes('Circle area (r=3):') && Math.abs(Number(l.text.split(':').pop()) - Math.PI * 9) < 0.01) && output.some(l => l.text.includes('Circle circumference (r=3):') && Math.abs(Number(l.text.split(':').pop()) - Math.PI * 6) < 0.01) },
          { name: "Rectangle area imported and works", test: (output) => output.some(l => l.text.includes('Rect area (4x5):') && l.text.includes('20')) },
          { name: "Rectangle perimeter imported and works", test: (output) => output.some(l => l.text.includes('Rect perimeter (4x5):') && l.text.includes('18')) }
        ]
      },
      {
        id: 5,
        title: "Dynamic Imports",
        files: {
          "heavy-module.js": `// Simulates a large module (e.g., chart library, editor)
export function renderChart(data) {
  return \`📊 Chart rendered with \${data.length} data points\`;
}

export function heavyComputation(n) {
  let result = 0;
  for (let i = 0; i < n * 100000; i++) result += Math.sqrt(i);
  return result;
}

console.log("⚡ heavy-module.js loaded");`,
          "main.js": `console.log("🚀 App started - heavy module NOT loaded yet");

const loadBtn = document.createElement('button');
loadBtn.textContent = "Load Heavy Module";
loadBtn.style.cssText = 'padding: 0.5rem 1rem; margin: 1rem 0; cursor: pointer;';
document.body.appendChild(loadBtn);

loadBtn.addEventListener('click', async () => {
  console.log("📥 Loading heavy module dynamically...");

  try {
    const { renderChart, heavyComputation } = await import('./heavy-module.js');
    console.log("✅ Module loaded!");
    console.log(renderChart([1, 2, 3, 4, 5]));
    console.log("Heavy computation result:", heavyComputation(100));
    loadBtn.disabled = true;
    loadBtn.textContent = "Loaded ✓";
  } catch (err) {
    console.error("❌ Failed to load:", err.message);
  }
});

// TODO: Add error handling for failed imports
// Try importing a non-existent module and catch the error`
        },
        content: `
          <h2>Dynamic Imports</h2>
          <p>Dynamic <code>import()</code> loads modules on-demand at runtime. It returns a <strong>Promise</strong>, enabling code splitting and lazy loading.</p>
          <pre><code>// Static import (top-level, synchronous)
import { foo } from './module.js';

// Dynamic import (anywhere, asynchronous)
const module = await import('./module.js');
const { foo } = module;

// Or with IIFE (older pattern)
import('./module.js').then(module => { /* ... */ });</code></pre>
          <p>Use cases:</p>
          <ul style="margin-left: 1.5rem; margin-bottom: 1rem; color: var(--muted); line-height: 1.8;">
            <li>Code splitting — load features only when needed</li>
            <li>Conditional loading — based on user role, device, etc.</li>
            <li>Lazy loading — defer non-critical code</li>
          </ul>
          <p><code>import()</code> works in regular scripts too (not just modules)!</p>
          <div class="exercise">
            <h3>🎯 Exercise: Handle Import Errors</h3>
            <p>Add a second button that tries to import <code>./non-existent.js</code> and catches the error.</p>
            <p>Log a friendly message like "Module not found" instead of the raw error.</p>
            <p class="hint">💡 Wrap <code>await import()</code> in try/catch. The error will have a message like "Failed to fetch dynamically imported module".</p>
          </div>
        `,
        verification: [
          { name: "App starts without loading heavy module", test: (output) => output.some(l => l.text.includes('App started') && l.text.includes('NOT loaded')) },
          { name: "Dynamic import works", test: (output) => output.some(l => l.text.includes('Loading heavy module dynamically')) && output.some(l => l.text.includes('Module loaded')) },
          { name: "Heavy module functions execute", test: (output) => output.some(l => l.text.includes('Chart rendered')) && output.some(l => l.text.includes('Heavy computation result')) },
          { name: "Error handling implemented", test: (output) => output.some(l => l.text.toLowerCase().includes('non-existent') || l.text.toLowerCase().includes('module not found') || l.text.toLowerCase().includes('failed to fetch')) }
        ]
      },
      {
        id: 6,
        title: "Module Patterns & Best Practices",
        files: {
          "config.js": `// Configuration module - singleton pattern
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

export function getConfig() { return { ...config }; }
export function setConfig(updates) { Object.assign(config, updates); }

export default config;`,
          "logger.js": `// Logger module - encapsulates implementation
const logs = [];
const levels = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel = levels.info;

function format(level, msg) {
  const timestamp = new Date().toISOString();
  return \`[\${timestamp}] \${level.toUpperCase()}: \${msg}\`;
}

export const logger = {
  debug: (msg) => { if (currentLevel <= levels.debug) logs.push(format('debug', msg)); },
  info: (msg) => { if (currentLevel <= levels.info) logs.push(format('info', msg)); },
  warn: (msg) => { if (currentLevel <= levels.warn) logs.push(format('warn', msg)); },
  error: (msg) => { if (currentLevel <= levels.error) logs.push(format('error', msg)); },
  getLogs: () => [...logs],
  setLevel: (level) => { currentLevel = levels[level] ?? levels.info; }
};

export default logger;`,
          "main.js": `import config, { getConfig, setConfig } from './config.js';
import logger, { logger as log } from './logger.js';

console.log("⚙️ Config & Logger Demo");

// Config usage
console.log("Initial config:", getConfig());
setConfig({ timeout: 10000, debug: true });
console.log("Updated config:", getConfig());

// Logger usage
log.info("Application started");
log.debug("Debug info: loading resources");
log.warn("Warning: deprecated API used");
log.error("Error: failed to fetch data");

console.log("\\nAll logs:");
logger.getLogs().forEach(l => console.log(l));

// The default config object is shared and mutable; getConfig() returns a copy.
// TODO: Add a new log level 'fatal' to the logger`
        },
        content: `
          <h2>Module Patterns & Best Practices</h2>
          <p>Modules enable powerful patterns for organizing code:</p>

          <h3 style="margin: 1rem 0 0.5rem; color: var(--accent);">Singleton State</h3>
          <p>Modules are singletons — shared state across imports:</p>
          <pre><code>// config.js
const state = { theme: 'dark' };
export function getTheme() { return state.theme; }
export function setTheme(t) { state.theme = t; }</code></pre>

          <h3 style="margin: 1rem 0 0.5rem; color: var(--accent);">Encapsulation</h3>
          <p>Private implementation details stay hidden:</p>
          <pre><code>// logger.js
const logs = []; // Private!
export const logger = { info: (msg) => logs.push(msg), getLogs: () => logs };</code></pre>

          <h3 style="margin: 1rem 0 0.5rem; color: var(--accent);">Factory Functions</h3>
          <pre><code>// userFactory.js
export function createUser(name, email) {
  return { name, email, id: crypto.randomUUID(), createdAt: new Date() };
}</code></pre>

          <div class="exercise">
            <h3>🎯 Exercise: Extend the Logger</h3>
            <p>Add a <code>fatal</code> log level (higher than error) to the logger in <code>logger.js</code>.</p>
            <p>Then use it in <code>main.js</code> and verify it appears in the logs.</p>
            <p class="hint">💡 Add <code>fatal: 4</code> to the levels object, add a <code>fatal</code> method, and update <code>setLevel</code> to handle it.</p>
          </div>
        `,
        verification: [
          { name: "Config getter/setter works", test: (output) => output.some(l => l.text.includes('Initial config:') && l.text.includes('timeout: 5000')) && output.some(l => l.text.includes('Updated config:') && l.text.includes('timeout: 10000')) },
          { name: "Logger methods work", test: (output) => output.some(l => l.text.includes('INFO: Application started')) && output.some(l => l.text.includes('WARN: Warning')) && output.some(l => l.text.includes('ERROR: Error')) },
          { name: "Fatal level added", test: (output) => output.some(l => l.text.includes('FATAL:') || l.text.includes('fatal')) }
        ]
      }
    ];

    let currentLesson = 0;
    let editor = null;
    let models = new Map();
    let activeTab = 'main.js';
    let iframe = null;
    let outputLines = [];
    let stopRun = null;
    let executionVersion = 0;
    let editVersion = 0;
    const completedLessons = new Set();

    const lessonListEl = document.getElementById('lesson-list');
    const tabsEl = document.getElementById('tabs');
    const editorContainer = document.getElementById('editor-container');
    const lessonContentEl = document.getElementById('lesson-content');
    const outputContentEl = document.getElementById('output-content');
    const runBtn = document.getElementById('run-btn');
    const resetBtn = document.getElementById('reset-btn');
    const verifyBtn = document.getElementById('verify-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressText = document.getElementById('progress-text');
    const progressFill = document.getElementById('progress-fill');
    const clearOutputBtn = document.getElementById('clear-output');

    function initLessons() {
      LESSONS.forEach((lesson, i) => {
        const el = document.createElement('div');
        el.className = 'lesson-item' + (i === 0 ? ' active' : '');
        el.dataset.index = i;
        el.innerHTML = `<span class="lesson-number">${i + 1}</span><span class="lesson-title">${lesson.title}</span>`;
        el.addEventListener('click', () => loadLesson(i));
        lessonListEl.appendChild(el);
      });
    }

    async function initMonaco() {
      return new Promise((resolve, reject) => {
        require.config({ paths: { vs: '/vendor/monaco/vs' } });
        require(['vs/editor/editor.main'], () => {
          editor = monaco.editor.create(editorContainer, {
            value: '',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            tabSize: 2,
            wordWrap: 'on'
          });
          editor.onDidChangeModelContent(() => {
            editVersion++;
            verifyBtn.disabled = true;
            nextBtn.disabled = true;
          });
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, runCode);
          resolve();
        }, reject);
      });
    }

    function stopExecution() {
      executionVersion++;
      if (stopRun) stopRun();
      if (iframe) iframe.remove();
      iframe = null;
      runBtn.disabled = false;
      runBtn.innerHTML = '<span class="keybinding">Ctrl+Enter</span> Run Code';
    }

    function loadLesson(index) {
      stopExecution();
      currentLesson = index;
      const lesson = LESSONS[index];

      document.querySelectorAll('.lesson-item').forEach((el, i) => {
        el.classList.toggle('active', i === index);
        el.classList.toggle('completed', completedLessons.has(i));
      });

      progressText.textContent = `Lesson ${index + 1} of ${LESSONS.length}`;
      progressFill.style.width = `${((index + 1) / LESSONS.length) * 100}%`;

      editor.setModel(null);
      models.forEach(model => model.dispose());
      models.clear();

      Object.entries(lesson.files).forEach(([filename, content]) => {
        const model = monaco.editor.createModel(content, 'javascript', monaco.Uri.parse(`inmemory:///${filename}`));
        models.set(filename, model);
      });

      renderTabs();
      switchTab('main.js');
      lessonContentEl.innerHTML = lesson.content;
      clearOutput();
      verifyBtn.disabled = true;
      nextBtn.disabled = true;
    }

    function renderTabs() {
      tabsEl.innerHTML = '';
      models.forEach((model, filename) => {
        const tab = document.createElement('div');
        tab.className = 'tab' + (filename === activeTab ? ' active' : '');
        tab.dataset.file = filename;
        tab.innerHTML = `${filename} <span class="close" data-file="${filename}">×</span>`;
        tab.addEventListener('click', (e) => {
          if (!e.target.classList.contains('close')) switchTab(filename);
        });
        tab.querySelector('.close').addEventListener('click', (e) => {
          e.stopPropagation();
          closeTab(filename);
        });
        tabsEl.appendChild(tab);
      });
    }

    function switchTab(filename) {
      const model = models.get(filename);
      if (model) {
        activeTab = filename;
        editor.setModel(model);
        renderTabs();
      }
    }

    function closeTab(filename) {
      if (models.size <= 1) return;
      const model = models.get(filename);
      if (model) {
        model.dispose();
        models.delete(filename);
        verifyBtn.disabled = true;
        nextBtn.disabled = true;
        if (activeTab === filename) {
          activeTab = models.keys().next().value;
        }
        switchTab(activeTab);
      }
    }

    function clearOutput() {
      outputLines = [];
      outputContentEl.innerHTML = '';
    }

    function logOutput(text, type = 'log') {
      const line = document.createElement('div');
      line.className = `output-line ${type}`;
      line.textContent = text;
      outputContentEl.appendChild(line);
      outputContentEl.scrollTop = outputContentEl.scrollHeight;
      outputLines.push({ text, type });
    }

    async function runCode() {
      if (runBtn.disabled) return;
      stopExecution();
      const version = executionVersion;
      const edits = editVersion;
      clearOutput();
      nextBtn.disabled = true;
      verifyBtn.disabled = true;
      document.querySelectorAll('.verify-item').forEach(el => el.remove());
      runBtn.disabled = true;
      runBtn.textContent = 'Running...';

      try {
        const files = {};
        models.forEach((model, filename) => {
          files[filename] = model.getValue();
        });

        await executeInIframe(files, version);
      } catch (err) {
        if (version === executionVersion) logOutput(`Execution error: ${err.message}`, 'error');
      } finally {
        if (version !== executionVersion) return;
        runBtn.disabled = false;
        runBtn.innerHTML = '<span class="keybinding">Ctrl+Enter</span> Run Code';
        verifyBtn.disabled = edits !== editVersion;
      }
    }

    async function executeInIframe(files, version) {
      const response = await fetch('/api/runs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files })
      });
      if (!response.ok) throw new Error(await response.text());
      const { url } = await response.json();
      if (version !== executionVersion) return;
      iframe = document.createElement('iframe');
      iframe.title = 'Lesson code preview';
      iframe.setAttribute('sandbox', 'allow-scripts');
      document.getElementById('preview-panel').appendChild(iframe);
      const frame = iframe;
      return new Promise((resolve, reject) => {
        let timer;
        const cleanup = () => {
          clearTimeout(timer);
          window.removeEventListener('message', onMessage);
        };
        const onMessage = event => {
          if (event.source !== frame.contentWindow || !event.data) return;
          if (event.data.type === 'log') logOutput(event.data.text, event.data.level);
          if (event.data.type === 'done') {
            clearTimeout(timer);
            // Keep listening for logs from buttons and delayed imports.
            resolve();
          }
        };
        stopRun = () => { cleanup(); resolve(); stopRun = null; };
        window.addEventListener('message', onMessage);
        timer = setTimeout(() => {
          cleanup();
          reject(new Error('Code did not finish within 10 seconds. Check for unresolved promises.'));
        }, 10000);
        frame.src = url;
      });
    }

    function verifySolution() {
      const lesson = LESSONS[currentLesson];
      let allPass = !outputLines.some(line => line.type === 'error');
      nextBtn.disabled = true;

      document.querySelectorAll('.verify-item').forEach(el => el.remove());

      lesson.verification.forEach((check, i) => {
        const pass = check.test(outputLines);
        const item = document.createElement('div');
        item.className = `verify-item ${pass ? 'pass' : 'fail'}`;
        item.innerHTML = `<span class="verify-icon">${pass ? '✓' : '✗'}</span> ${check.name}`;
        lessonContentEl.querySelector('.exercise').appendChild(item);
        if (!pass) allPass = false;
      });

      if (allPass) {
        completedLessons.add(currentLesson);
        nextBtn.disabled = currentLesson === LESSONS.length - 1;
        showToast('All checks passed! 🎉', 'success');
        document.querySelector(`.lesson-item[data-index="${currentLesson}"]`).classList.add('completed');
      } else {
        showToast('Some checks failed. Review the exercise.', 'error');
      }
    }

    function showToast(message, type) {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }

    function resetFiles() {
      loadLesson(currentLesson);
    }

    async function init() {
      initLessons();
      await initMonaco();
      loadLesson(0);

      runBtn.addEventListener('click', runCode);
      resetBtn.addEventListener('click', resetFiles);
      verifyBtn.addEventListener('click', verifySolution);
      nextBtn.addEventListener('click', () => {
        if (currentLesson < LESSONS.length - 1) loadLesson(currentLesson + 1);
      });
      clearOutputBtn.addEventListener('click', () => { clearOutput(); verifyBtn.disabled = true; nextBtn.disabled = true; });
      await runCode();
    }

    init().catch(error => logOutput('Unable to start tutorial: ' + error.message, 'error'));
