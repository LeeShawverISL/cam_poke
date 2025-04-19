// Initialize Pyodide and set up the game
async function main() {
    // Show loading message
    const loadingElement = document.getElementById("loading");
    loadingElement.textContent = "Loading Python environment...";
    
    try {
        // Load Pyodide
        let pyodide = await loadPyodide();
        loadingElement.textContent = "Python environment loaded! Loading game...";
        
        // Redirect Python stdout to our output div
        // Redirect Python stdout to our output div
        pyodide.runPython(`
            import sys
            import js  // Add this import
            from pyodide.ffi import create_proxy
            
            class PyodideOutput:
                def __init__(self, element_id):
                    self.element_id = element_id
                    self.buffer = ""
                
                def write(self, text):
                    self.buffer += text
                    element = js.document.getElementById(self.element_id)  // Use js.document instead
                    element.textContent = self.buffer
                    return len(text)
                
                def flush(self):
                    pass
            
            sys.stdout = PyodideOutput("output")
            sys.stderr = PyodideOutput("output")
        `);
        
        // Load and run Python code
        const response = await fetch('python/main.py');
        const pythonCode = await response.text();
        
        loadingElement.textContent = "Running game code...";
       try {
            await pyodide.runPythonAsync(pythonCode);
            
            console.log("Python window object after initialization:", window.python);
            if (!window.python) {
                console.error("Python functions were not properly exposed to JavaScript");
                loadingElement.textContent = "Error: Python functions not available";
                return;
            }
            
            // Hide loading message and show game
            loadingElement.textContent = "";
            document.getElementById("game-container").style.display = "block";
            
            // Initialize UI and event handlers
            initializeGameUI();
       } catch (error) {
    console.error("Python execution error:", error);
    loadingElement.textContent = "Error loading game: " + error.message;
    
    // Try to get more details about the error from Python
    try {
        const errorDetails = pyodide.runPython("import sys; sys.last_traceback");
        console.error("Python traceback:", errorDetails);
    } catch (e) {
        console.error("Could not get Python traceback:", e);
    }
}
    } catch (error) {
        console.error("Python execution error:", error);
        loadingElement.textContent = "Error loading game: " + error.message;
    }
}

// Initialize game UI and attach event handlers
function initializeGameUI() {
    // Mode selection buttons
    document.getElementById("easy-btn").addEventListener("click", () => startGame("easy"));
    document.getElementById("medium-btn").addEventListener("click", () => startGame("medium"));
    document.getElementById("hard-btn").addEventListener("click", () => startGame("hard"));
    
    // Navigation buttons
    document.getElementById("ranking-back-btn").addEventListener("click", showStarterPage);
    document.getElementById("comparison-btn").addEventListener("click", showComparisonPage);
    document.getElementById("comparison-back-btn").addEventListener("click", () => startGame(window.python.get_level_data().mode));
    document.getElementById("home-btn").addEventListener("click", showStarterPage);
    
    // Submit button
    document.getElementById("submit-btn").addEventListener("click", checkRanking);
}

// Show the starter page
function showStarterPage() {
    hideAllPages();
    document.getElementById("starter-page").style.display = "block";
}

// Show the rankings page
function showRankingsPage() {
    hideAllPages();
    document.getElementById("rankings-page").style.display = "block";
}

// Show the comparison page
function showComparisonPage() {
    hideAllPages();
    document.getElementById("comparison-page").style.display = "block";
    
    // Get comparison data from Python
    const comparisonData = window.python.get_comparison_data();
    const container = document.getElementById("comparison-container");
    
    // Clear previous comparison
    container.innerHTML = '';
    
    // Create comparison cards
    const poke1 = comparisonData.pokemon1;
    const poke2 = comparisonData.pokemon2;
    
    container.innerHTML = `
        <div class="pokemon-card" style="background-color: lightyellow;">
            <h3>${poke1.name}</h3>
            <p>Attack: ${poke1.attack}</p>
            <p>Defense: ${poke1.defense}</p>
        </div>
        <div class="pokemon-card" style="background-color: lightblue;">
            <h3>${poke2.name}</h3>
            <p>Attack: ${poke2.attack}</p>
            <p>Defense: ${poke2.defense}</p>
        </div>
    `;
}

// Hide all game pages
function hideAllPages() {
    document.querySelectorAll(".game-page").forEach(page => {
        page.style.display = "none";
    });
}

// Start game with selected mode
function startGame(mode) {
    // Call Python function to start game
    const levelData = window.python.start_game(mode);
    updateRankingsPage(levelData);
    showRankingsPage();
}

// Update the rankings page with current level data
function updateRankingsPage(levelData) {
    // Update mode and level display
    document.getElementById("mode-display").textContent = 
        `Mode: ${capitalize(levelData.mode)} - Level ${levelData.level}/3`;
    
    // Update points
    document.getElementById("points-display").textContent = `Points: ${levelData.points}`;
    
    // Display pokémon list
    const pokemonListElement = document.getElementById("pokemon-list");
    pokemonListElement.innerHTML = '';
    
    levelData.pokemon.forEach(pokemon => {
        const pokemonElement = document.createElement("div");
        pokemonElement.className = "pokemon-item";
        pokemonElement.textContent = `${pokemon.name} (Attack: ${pokemon.attack})`;
        pokemonListElement.appendChild(pokemonElement);
    });
    
    // Create ranking inputs
    const rankingContainer = document.getElementById("ranking-container");
    rankingContainer.innerHTML = '';
    
    for (let i = 0; i < levelData.pokemon.length; i++) {
        const inputGroup = document.createElement("div");
        inputGroup.className = "input-group";
        
        const label = document.createElement("label");
        label.textContent = `#${i+1}:`;
        
        const input = document.createElement("input");
        input.type = "text";
        input.className = "ranking-input";
        input.placeholder = "Pokémon name";
        
        inputGroup.appendChild(label);
        inputGroup.appendChild(input);
        rankingContainer.appendChild(inputGroup);
    }
    
    // Clear any previous result message
    document.getElementById("result-message").textContent = "";
}

// Check the user's ranking
function checkRanking() {
    // Get user input
    const inputs = document.querySelectorAll(".ranking-input");
    const userOrder = Array.from(inputs).map(input => input.value.trim());
    
    // Call Python function to check ranking
    const result = window.python.check_ranking(userOrder);
    const resultElement = document.getElementById("result-message");
    
    if (result.correct) {
        resultElement.textContent = "Great job! You've ranked them correctly.";
        resultElement.className = "success-message";
    } else {
        resultElement.textContent = `Incorrect. The correct order was: ${result.correct_order.join(", ")}`;
        resultElement.className = "error-message";
    }
    
    // Update points display
    document.getElementById("points-display").textContent = `Points: ${result.points}`;
    
    // Check if level is complete
    if (result.level_complete) {
        setTimeout(() => {
            alert("You've completed all levels in this mode!");
            showStarterPage();
        }, 1500);
    } else {
        // Load the next level
        setTimeout(() => {
            const levelData = window.python.get_level_data();
            updateRankingsPage(levelData);
        }, 1500);
    }
}

// Helper function to capitalize first letter
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Start the application
main();
