# Web version of Pokémon Ranking Game
import random
import js
from pyodide.ffi import create_proxy

# Sample Pokémon data for the game (simplified)
pokemon_data = [
    {"name": "Pikachu", "attack": 55, "defense": 40},
    {"name": "Charmander", "attack": 52, "defense": 43},
    {"name": "Bulbasaur", "attack": 49, "defense": 49},
    {"name": "Squirtle", "attack": 48, "defense": 65},
    {"name": "Jigglypuff", "attack": 45, "defense": 20},
    {"name": "Meowth", "attack": 45, "defense": 35},
    {"name": "Psyduck", "attack": 52, "defense": 48},
    {"name": "Machop", "attack": 80, "defense": 50},
]

# Game state
game_state = {
    "points": 0,
    "current_level": 1,
    "current_mode": "easy",
    "sample": [],
}

def init_game():
    """Initialize the game and expose Python functions to JavaScript"""
    print("Pokémon Ranking Game initialized!")
    
    # Create functions that will be callable from JavaScript
    
    def get_pokemon_data():
        """Return the full Pokémon dataset"""
        return pokemon_data
    
    def start_game(mode):
        """Start a new game with the given mode"""
        game_state["current_mode"] = mode
        game_state["current_level"] = 1
        game_state["points"] = 0
        return get_level_data()
    
    def get_level_data():
        """Get data for the current level"""
        # Sample 3 pokémon for the current level
        game_state["sample"] = random.sample(pokemon_data, 3)
        return {
            "pokemon": game_state["sample"],
            "level": game_state["current_level"],
            "mode": game_state["current_mode"],
            "points": game_state["points"]
        }
    
    def check_ranking(user_order):
        """Check if the user's ranking is correct"""
        correct_order = sorted(game_state["sample"], key=lambda x: x['attack'], reverse=True)
        correct = [p['name'] for p in correct_order] == user_order
        
        if correct:
            game_state["points"] += 10
        
        game_state["current_level"] += 1
        level_complete = game_state["current_level"] > 3
        
        if level_complete:
            # Reset level for next time
            game_state["current_level"] = 1
        
        return {
            "correct": correct,
            "correct_order": [p['name'] for p in correct_order],
            "points": game_state["points"],
            "level_complete": level_complete
        }
    
    def get_comparison_data():
        """Get data for the comparison page"""
        poke1, poke2 = random.sample(pokemon_data, 2)
        return {
            "pokemon1": poke1,
            "pokemon2": poke2
        }
    
    # Expose Python functions to JavaScript
    js.window.python = {
        "get_pokemon_data": create_proxy(get_pokemon_data),
        "start_game": create_proxy(start_game),
        "get_level_data": create_proxy(get_level_data),
        "check_ranking": create_proxy(check_ranking),
        "get_comparison_data": create_proxy(get_comparison_data)
    }
    
    print("Python functions exposed to JavaScript with keys:", list(js.window.python.keys()))
    
print("Game ready! You can now interact with the Pokémon Ranking Game.")

# Initialize the game
init_game()
print("Game initialization complete")
