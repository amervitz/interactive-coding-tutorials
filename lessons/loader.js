import { parse } from '../vendor/yaml/index.js';
import MarkdownIt from '../vendor/markdown-it/markdown-it.esm.min.mjs';

const markdown = new MarkdownIt({ html: false });

async function readText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${url.pathname} (HTTP ${response.status})`);
  return response.text();
}

export async function loadLessons(root = new URL('./', import.meta.url)) {
  root = new URL(root, import.meta.url);
  const slugs = JSON.parse(await readText(new URL('index.json', root)));
  if (!Array.isArray(slugs) || !slugs.length ||
      slugs.some(slug => typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) ||
      new Set(slugs).size !== slugs.length) {
    throw new Error('Lesson index must contain unique lesson folder names');
  }
  const ids = new Set();
  return Promise.all(slugs.map(async slug => {
    try {
      const dir = new URL(`${slug}/`, root);
      const metadata = parse(await readText(new URL('lesson.yaml', dir)));
      if (!metadata || !Number.isInteger(metadata.id) || metadata.id < 1 || ids.has(metadata.id) ||
          typeof metadata.title !== 'string' || !metadata.title.trim() ||
          !Array.isArray(metadata.files) || !metadata.files.includes('main.js') ||
          new Set(metadata.files).size !== metadata.files.length ||
          metadata.files.some(name => typeof name !== 'string' ||
            !/^(?:[\w-]+\/)*[\w-][\w.-]*\.js$/.test(name))) {
        throw new Error('Expected a unique positive id, title, and starter file list including main.js');
      }
      ids.add(metadata.id);
      const instructions = await readText(new URL('instructions.md', dir));
      const tokens = markdown.parse(instructions, {});
      const exerciseIndex = tokens.findIndex((token, index) => token.type === 'heading_open' &&
        token.tag === 'h3' && tokens[index + 1]?.content.startsWith('🎯 Exercise:'));
      const content = markdown.renderer.render(exerciseIndex < 0 ? tokens : tokens.slice(0, exerciseIndex), markdown.options, {});
      const exercise = exerciseIndex < 0 ? '' : markdown.renderer.render(tokens.slice(exerciseIndex), markdown.options, {});
      const files = Object.fromEntries(await Promise.all(metadata.files.map(async name =>
        [name, await readText(new URL(`starter/${name}`, dir))])));
      const { default: verification } = await import(new URL('checks.js', dir).href);
      if (!Array.isArray(verification) || !verification.length ||
          verification.some(check => !check || typeof check.name !== 'string' || typeof check.test !== 'function')) {
        throw new Error('Expected verification checks with a name and test function');
      }
      return { id: metadata.id, title: metadata.title, content, exercise, files, verification };
    } catch (error) {
      throw new Error(`Unable to load lesson "${slug}": ${error.message}`);
    }
  }));
}
