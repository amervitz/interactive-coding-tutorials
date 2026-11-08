let LESSONS = [];
const appBaseUrl = new URL('./', document.currentScript.src);
let tutorial = null;
let runner = null;

let currentLesson = 0;
let editor = null;
let models = new Map();
let activeTab = null;
let outputLines = [];
let compilationLines = [];
let activeOutput = 'console';
let executionVersion = 0;
let editVersion = 0;
const completedLessons = new Set();

const lessonListEl = document.getElementById('lesson-list');
const tabsEl = document.getElementById('tabs');
const editorContainer = document.getElementById('editor-container');
const lessonContentEl = document.getElementById('lesson-content');
const outputContentEl = document.getElementById('output-content');
const compilationContentEl = document.getElementById('compilation-content');
const runBtn = document.getElementById('run-btn');
const stopBtn = document.getElementById('stop-btn');
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
    el.title = lesson.title;
    el.innerHTML = `<span class="lesson-number">${i + 1}</span><span class="lesson-title">${lesson.title}</span>`;
    el.addEventListener('click', () => loadLesson(i));
    lessonListEl.appendChild(el);
  });
}

async function initMonaco() {
  return new Promise((resolve, reject) => {
    require.config({ paths: { vs: new URL('./vendor/monaco/vs', appBaseUrl).href } });
    require(['vs/editor/editor.main'], () => {
      editor = monaco.editor.create(editorContainer, {
        value: '',
        language: tutorial.editorLanguage,
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
  if (runner) runner.stop();
  if (stopBtn) stopBtn.disabled = true;
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
    const model = monaco.editor.createModel(content, filename.endsWith('.csproj') ? 'xml' : lesson.language, monaco.Uri.parse(`inmemory:///${filename}`));
    models.set(filename, model);
  });

  renderTabs();
  switchTab(lesson.entryFile);
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
  selectOutput('console');
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

function selectOutput(channel) {
  activeOutput = channel;
  if (!compilationContentEl) return;
  document.querySelectorAll('.output-tabs [role="tab"]').forEach(tab => {
    const selected = tab.id === `${channel}-output-tab`;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
  });
}

function clearOutput(channel) {
  if (!channel || channel === 'console') {
    outputLines = [];
    outputContentEl.innerHTML = '';
  }
  if (!channel || channel === 'compilation') {
    compilationLines = [];
    if (compilationContentEl) compilationContentEl.innerHTML = '';
  }
}

function logOutput(text, type = 'log', channel = 'console') {
  const compilation = channel === 'compilation' && compilationContentEl;
  const target = compilation ? compilationContentEl : outputContentEl;
  const line = document.createElement('div');
  line.className = `output-line ${type}`;
  line.textContent = text;
  target.appendChild(line);
  target.scrollTop = target.scrollHeight;
  (compilation ? compilationLines : outputLines).push({ text, type });
  if (type === 'error') selectOutput(compilation ? 'compilation' : 'console');
}

async function runCode() {
  if (runBtn.disabled) return;
  stopExecution();
  const version = executionVersion;
  const edits = editVersion;
  clearOutput();
  selectOutput('console');
  nextBtn.disabled = true;
  verifyBtn.disabled = true;
  document.querySelectorAll('.verify-item').forEach(el => el.remove());
  runBtn.disabled = true;
  runBtn.textContent = 'Running...';
  if (stopBtn) stopBtn.disabled = false;

  try {
    const files = {};
    models.forEach((model, filename) => {
      files[filename] = model.getValue();
    });

    await runner.run(files, (text, level, channel) => {
      if (version === executionVersion) logOutput(text, level, channel);
    });
  } catch (err) {
    if (version === executionVersion) logOutput(`Execution error: ${err.message}`, 'error');
  } finally {
    if (version !== executionVersion) return;
    if (stopBtn) stopBtn.disabled = true;
    runBtn.disabled = false;
    runBtn.innerHTML = '<span class="keybinding">Ctrl+Enter</span> Run Code';
    verifyBtn.disabled = edits !== editVersion;
  }
}

function verifySolution() {
  const lesson = LESSONS[currentLesson];
  let allPass = ![...outputLines, ...compilationLines].some(line => line.type === 'error');
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
  const { languages } = await import('./tutorials/languages.js');
  const language = new URLSearchParams(location.search).get('lang') ?? 'js';
  if (!Object.hasOwn(languages, language)) {
    document.getElementById('tutorial-title').textContent = 'Tutorial unavailable';
    progressText.textContent = 'Choose a tutorial from the home page';
    throw new Error(`Unsupported tutorial language: ${language}`);
  }
  tutorial = languages[language];
  document.title = tutorial.title;
  document.getElementById('tutorial-title').textContent = tutorial.title;
  document.body.dataset.language = tutorial.editorLanguage;
  document.getElementById('preview-panel').hidden = !tutorial.preview;
  document.getElementById('runtime-status').hidden = !tutorial.runtimeStatus;
  document.getElementById('compilation-output-tab').hidden = !tutorial.compilation;
  stopBtn.hidden = !tutorial.stop;
  const Runner = await tutorial.loadRunner();
  runner = new Runner(document.getElementById(tutorial.runnerTarget));
  window.addEventListener('pagehide', () => runner.stop());
  ({ default: LESSONS } = await tutorial.loadLessons());
  initLessons();
  await initMonaco();
  loadLesson(0);
  resetBtn.disabled = false;

  const outputTabs = [...document.querySelectorAll('.output-tabs [role="tab"]')].filter(tab => !tab.hidden);
  outputTabs.forEach((tab, index) => {
    const activate = selected => {
      selectOutput(selected.id === 'compilation-output-tab' ? 'compilation' : 'console');
    };
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      const offsets = { ArrowRight: 1, ArrowLeft: -1, Home: -index, End: outputTabs.length - 1 - index };
      if (!Object.hasOwn(offsets, event.key)) return;
      event.preventDefault();
      const next = outputTabs[(index + offsets[event.key] + outputTabs.length) % outputTabs.length];
      activate(next);
      next.focus();
    });
  });

  runBtn.addEventListener('click', runCode);
  if (stopBtn) stopBtn.addEventListener('click', () => {
    stopExecution();
    verifyBtn.disabled = true;
    nextBtn.disabled = true;
    logOutput('Execution stopped.', 'info');
  });
  resetBtn.addEventListener('click', resetFiles);
  verifyBtn.addEventListener('click', verifySolution);
  nextBtn.addEventListener('click', () => {
    if (currentLesson < LESSONS.length - 1) loadLesson(currentLesson + 1);
  });
  clearOutputBtn.addEventListener('click', () => { clearOutput(activeOutput); verifyBtn.disabled = true; nextBtn.disabled = true; });
  await runCode();
}

init().catch(error => logOutput('Unable to start tutorial: ' + error.message, 'error'));
