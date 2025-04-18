// Initialize Pyodide
async function main() {
    let pyodide = await loadPyodide();
    document.getElementById("loading").textContent = "Python environment loaded!";
    
    // Redirect Python stdout to our output div
    pyodide.runPython(`
        import sys
        from pyodide.ffi import create_proxy
        
        class PyodideOutput:
            def __init__(self, element_id):
                self.element_id = element_id
                self.buffer = ""
            
            def write(self, text):
                self.buffer += text
                element = document.getElementById(self.element_id)
                element.textContent = self.buffer
                return len(text)
            
            def flush(self):
                pass
        
        sys.stdout = PyodideOutput("output")
        sys.stderr = PyodideOutput("output")
    `);
    
    // Load and run your Python code
    try {
        const response = await fetch('python/main.py');
        const pythonCode = await response.text();
        
        // First handle imports from pyproject.toml
        await loadDependencies(pyodide);
        
        // Then run your code
        document.getElementById("loading").textContent = "Running Python code...";
        await pyodide.runPythonAsync(pythonCode);
        document.getElementById("loading").textContent = "Execution complete!";
    } catch (error) {
        console.error("Python execution error:", error);
        document.getElementById("output").textContent += "\nError: " + error.message;
        document.getElementById("loading").textContent = "Execution failed!";
    }
}

// Function to handle loading dependencies from pyproject.toml
async function loadDependencies(pyodide) {
    try {
        const response = await fetch('python/pyproject.toml');
        const tomlContent = await response.text();
        
        // Extract dependencies from pyproject.toml
        // This is a simple parser and might need to be enhanced for complex TOML files
        const depsMatch = tomlContent.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(\[|\Z)/);
        if (depsMatch) {
            const depsSection = depsMatch[1];
            const depsLines = depsSection.split('\n').filter(line => line.trim() && !line.includes('python'));
            
            const dependencies = [];
            depsLines.forEach(line => {
                const depMatch = line.match(/([a-zA-Z0-9_\-]+)\s*=/);
                if (depMatch) {
                    dependencies.push(depMatch[1]);
                }
            });
            
            if (dependencies.length > 0) {
                document.getElementById("loading").textContent = "Installing dependencies...";
                await pyodide.loadPackagesFromImports(dependencies.join(', '));
                document.getElementById("loading").textContent = "Dependencies installed!";
            }
        }
    } catch (error) {
        console.error("Failed to load dependencies:", error);
        document.getElementById("output").textContent += "\nWarning: Failed to load dependencies - " + error.message;
    }
}

// Start the application
main();
