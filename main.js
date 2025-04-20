// Initialize Pyodide and set up the game
async function main() {
    const loadingElement = document.getElementById("loading");
    loadingElement.textContent = "Loading Python environment...";

    try {
        // Load Pyodide
        let pyodide = await loadPyodide();
        loadingElement.textContent = "Python environment loaded! Running game code...";

        // Redirect Python stdout to a div
        await pyodide.runPythonAsync(`
            import sys
            import js
            from pyodide.ffi import create_proxy

            class PyodideOutput:
                def __init__(self, element_id):
                    self.element_id = element_id
                    self.buffer = ""

                def write(self, text):
                    self.buffer += text
                    element = js.document.getElementById(self.element_id)
                    element.textContent = self.buffer
                    return len(text)

                def flush(self):
                    pass

            sys.stdout = PyodideOutput("output")
            sys.stderr = PyodideOutput("output")
        `);

        // Load and run Python game logic
        const response = await fetch("python/main.py");
        const pythonCode = await response.text();
        await pyodide.runPythonAsync(pythonCode);

        // Extract Python-exposed functions into JS
        // Load and run Python code
        const response = await fetch("python/main.py");
        const pythonCode = await response.text();
        await pyodide.runPythonAsync(pythonCode);
        
        // ✅ Pyodide 0.24+ compatible access to js.window.python
        const proxy = pyodide.globals.get("js").window.python;
        
        window.python = {
            get_pokemon_data: proxy.get_pokemon_data,
            start_game: proxy.start_game,
            get_level_data: proxy.get_level_data,
            check_ranking: proxy.check_ranking,
            get_comparison_data: proxy.get_comparison_data
        };
        
        console.log("✅ Successfully unwrapped Python functions");
        console.log("Is start_game a function?", typeof window.python?.start_game);
        
        if (!window.python || typeof window.python.start_game !== "function") {
            console.error("Python functions not available or not properly exported");
            loadingElement.textContent = "Error: Game functions not available";
            return;
        }


        // All good — hide loader and show game
        loadingElement.textContent = "";
        document.getElementById("game-container").style.display = "block";
        initializeGameUI();

    } catch (error) {
        console.error("Error loading game:", error);
        loadingElement.textContent = "Error loading game: " + error.message;
    }
}

main();
