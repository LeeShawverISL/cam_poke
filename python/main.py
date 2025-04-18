import tkinter as tk
from tkinter import messagebox
import random

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

points = 0
current_level = 1
current_mode = "easy"

class PokemonGame:
    def __init__(self, master):
        self.master = master
        self.master.title("Pokémon Ranking Game")
        self.master.geometry("700x500")
        self.points = 0

        self.starter_page()

    def clear_screen(self):
        for widget in self.master.winfo_children():
            widget.destroy()

    def starter_page(self):
        self.clear_screen()
        self.master.configure(bg='#FFCCFF')

        title = tk.Label(self.master, text="Pokémon Game", font=("Arial", 24, "bold"), bg='#FFCCFF')
        title.pack(pady=30)

        instructions = tk.Label(
            self.master,
            text="Welcome! Choose a mode to begin ranking Pokémon by their attack strength!",
            font=("Arial", 14), bg='#FFCCFF'
        )
        instructions.pack(pady=10)

        for mode in ["easy", "medium", "hard"]:
            tk.Button(self.master, text=mode.title(), font=("Arial", 16), width=20,
                      command=lambda m=mode: self.rankings_page(m)).pack(pady=10)

    def rankings_page(self, mode):
        global current_mode, current_level
        self.clear_screen()
        self.master.configure(bg='#CCFFCC')
        current_mode = mode
        current_level = 1

        tk.Label(self.master, text=f"Mode: {mode.title()} - Level {current_level}/3",
                 font=("Arial", 16), bg='#CCFFCC').pack(pady=10)

        tk.Label(self.master, text=f"Points: {self.points}", font=("Arial", 14), bg='#CCFFCC').pack()

        tk.Label(
            self.master,
            text="Put these Pokémon in order of attack strength (strongest to weakest):",
            font=("Arial", 12), bg='#CCFFCC'
        ).pack(pady=10)

        self.sample = random.sample(pokemon_data, 3)
        self.entries = []
        for i, poke in enumerate(self.sample):
            tk.Label(self.master, text=f"{poke['name']} (Attack: {poke['attack']})",
                     font=("Arial", 12), bg='#CCFFCC').pack()
            entry = tk.Entry(self.master)
            entry.pack(pady=5)
            self.entries.append(entry)

        example_label = tk.Label(self.master, text="Example: Pikachu, Bulbasaur, Squirtle",
                                 font=("Arial", 10, "italic"), bg='#CCFFCC')
        example_label.pack(pady=5)

        submit_btn = tk.Button(self.master, text="Submit", command=self.check_ranking, font=("Arial", 14))
        submit_btn.pack(pady=10)

        nav_frame = tk.Frame(self.master, bg='#CCFFCC')
        nav_frame.pack(pady=20)

        back_btn = tk.Button(nav_frame, text="⬅ Back", command=self.starter_page, font=("Arial", 12))
        back_btn.pack(side="left", padx=20)

        next_btn = tk.Button(nav_frame, text="➡ Go to Comparison", command=self.comparison_page, font=("Arial", 12))
        next_btn.pack(side="left", padx=20)

    def check_ranking(self):
        global current_level
        correct_order = sorted(self.sample, key=lambda x: x['attack'], reverse=True)
        user_order = [e.get().strip() for e in self.entries]

        if [p['name'] for p in correct_order] == user_order:
            self.points += 10
            messagebox.showinfo("Correct!", "Great job! You've ranked them correctly.")
        else:
            messagebox.showerror("Incorrect", "Oops! Try again or go to the next level.")

        current_level += 1
        if current_level <= 3:
            self.rankings_page(current_mode)
        else:
            messagebox.showinfo("Level Complete", "You've completed all levels in this mode!")
            self.starter_page()

    def comparison_page(self):
        self.clear_screen()
        self.master.configure(bg='#CCE5FF')

        tk.Label(self.master, text="Comparison Page", font=("Arial", 18, "bold"), bg='#CCE5FF').pack(pady=20)
        tk.Label(self.master, text="Here’s how two Pokémon compare in attack and defense:", font=("Arial", 12), bg='#CCE5FF').pack(pady=5)

        poke1, poke2 = random.sample(pokemon_data, 2)

        frame = tk.Frame(self.master, bg='#CCE5FF')
        frame.pack(pady=20)

        tk.Label(frame, text=f"{poke1['name']}\nAttack: {poke1['attack']}\nDefense: {poke1['defense']}",
                 font=("Arial", 12), bg='lightyellow', relief='solid', width=20).grid(row=0, column=0, padx=10)

        tk.Label(frame, text=f"{poke2['name']}\nAttack: {poke2['attack']}\nDefense: {poke2['defense']}",
                 font=("Arial", 12), bg='lightblue', relief='solid', width=20).grid(row=0, column=1, padx=10)

        nav_frame = tk.Frame(self.master, bg='#CCE5FF')
        nav_frame.pack(pady=30)

        back_btn = tk.Button(nav_frame, text="⬅ Back to Rankings", command=lambda: self.rankings_page(current_mode), font=("Arial", 12))
        back_btn.pack(side="left", padx=20)

        home_btn = tk.Button(nav_frame, text="🏠 Home", command=self.starter_page, font=("Arial", 12))
        home_btn.pack(side="left", padx=20)


if __name__ == "__main__":
    root = tk.Tk()
    app = PokemonGame(root)
    root.mainloop()
