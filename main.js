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

        // Fetch and run your Python game logic
        const response = await fetch("python/main.py");
        const pythonCode = await response.text();
        await pyodide.runPythonAsync(pythonCode);
        
        // ✅ FIX: Extract real JS-callable functions from the Pyodide proxy
        try {
            const jsWindow = pyodide.globals.get("js").get("window");
            const proxy = jsWindow.get("python");
        
            window.python = {
                get_pokemon_data: proxy.get("get_pokemon_data"),
                start_game: proxy.get("start_game"),
                get_level_data: proxy.get("get_level_data"),
                check_ranking: proxy.get("check_ranking"),
                get_comparison_data: proxy.get("get_comparison_data")
            };
        
            console.log("✅ Successfully unwrapped Python functions");
        } catch (e) {
            console.error("❌ Error unwrapping Python functions:", e);
            loadingElement.textContent = "Error: Failed to access Python functions";
            return;
        }
        
        console.log("window.python contents:", window.python);
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
