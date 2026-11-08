let LESSONS = [];

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
    require.config({ paths: { vs: new URL('./vendor/monaco/vs', location.href).href } });
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
  if (lesson.exercise) {
    const exercise = document.createElement('section');
    exercise.className = 'exercise';
    exercise.innerHTML = lesson.exercise;
    lessonContentEl.appendChild(exercise);
  }
  const results = document.createElement('section');
  results.id = 'verification-results';
  results.className = 'verification';
  results.setAttribute('aria-label', 'Verification results');
  results.setAttribute('aria-live', 'polite');
  results.hidden = true;
  lessonContentEl.appendChild(results);
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
  const { analyzeFiles } = await import('./module-files.js');
  const sources = await analyzeFiles(files);
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
      if (event.data.type === 'ready') frame.contentWindow.postMessage({ type: 'run', files: sources }, '*');
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
    frame.src = './runner.html';
  });
}

function verifySolution() {
  const lesson = LESSONS[currentLesson];
  let allPass = !outputLines.some(line => line.type === 'error');
  nextBtn.disabled = true;

  document.querySelectorAll('.verify-item').forEach(el => el.remove());
  const results = document.getElementById('verification-results');
  results.hidden = false;

  lesson.verification.forEach((check, i) => {
    const pass = check.test(outputLines);
    const item = document.createElement('div');
    item.className = `verify-item ${pass ? 'pass' : 'fail'}`;
    item.innerHTML = `<span class="verify-icon">${pass ? '✓' : '✗'}</span> ${check.name}`;
    results.appendChild(item);
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
  ({ default: LESSONS } = await import('./lessons/index.js'));
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
