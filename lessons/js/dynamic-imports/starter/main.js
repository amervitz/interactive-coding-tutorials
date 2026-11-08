console.log("🚀 App started - heavy module NOT loaded yet");

const loadBtn = document.createElement('button');
loadBtn.textContent = "Load Heavy Module";
loadBtn.className = 'load-module-button';
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
// Try importing a non-existent module and catch the error