# Python WebAssembly App

This repository contains a Python application compiled to WebAssembly using Pyodide for running in the browser.

## Project Structure

```
├── index.html       # Main HTML file that loads Pyodide and your Python app
├── main.js          # JavaScript file to handle loading and running Python
├── style.css        # CSS styling for the web app
├── python/          # Directory containing Python code
│   ├── main.py      # Your main Python script
│   └── pyproject.toml  # Python dependencies
├── generated-icon.png  # App icon
└── .github/         # GitHub workflows
    └── workflows/
        └── deploy.yml  # GitHub Actions workflow for deployment
```

## How It Works

1. The web page loads Pyodide, a Python distribution for the browser
2. Your Python script is fetched and executed in the WebAssembly environment
3. Any output from your Python code is displayed in the browser

## Deployment

This app is automatically deployed to GitHub Pages whenever changes are pushed to the main branch.

## Local Development

To test locally, use a local web server:

```bash
# Using Python's built-in server
python -m http.server

# Then visit http://localhost:8000 in your browser
```

## Dependencies

- Pyodide v0.24.1
- Any Python packages listed in pyproject.toml
