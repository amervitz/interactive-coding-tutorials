## What are JavaScript Modules?

Modules let you split your code into separate files, each with its own scope. Variables and functions declared in a module are **private by default** — they don't pollute the global scope.

Key characteristics:

- Run in `strict mode` automatically
- Have their own top-level scope (no global pollution)
- Load asynchronously (non-blocking)
- Use `import`/`export` syntax
- Are singletons — same module imported multiple times shares one instance

To use modules in the browser, add `type="module"` to your script tag:

```html
<script type="module" src="main.js"></script>
```

### 🎯 Exercise: Explore the Module Scope

Notice that `main.js` runs automatically. Check the console output — it shows "Module loaded: main.js".

Try uncommenting the import line (it will fail because `utils.js` doesn't exist yet).

> 💡 Modules are loaded via HTTP — you need a local server (like `npx serve` or VS Code Live Server) for imports to work in the browser.
