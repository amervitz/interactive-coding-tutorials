import { loadLessons } from '../loader.js';

export default await loadLessons(new URL('./', import.meta.url));
