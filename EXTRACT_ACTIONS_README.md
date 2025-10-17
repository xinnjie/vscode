# Extract VS Code Actions

## Step 1: Run and redirect output
```bash
cd vscode

# Start and capture logs
./scripts/code.sh 2>&1 | tee /tmp/vscode.log
```

## Step 2: Parse the log file and output JSON
```bash
# Output to stdout
node scripts/parse-actions-log.js /tmp/vscode.log

# Or save to file
node scripts/parse-actions-log.js /tmp/vscode.log > actions.json
```

## Output Format

The script outputs a JSON array of actions with the following structure:

```json
[
  {
    "id": "editor.action.goToReferences",
    "title": "Go to References",
    "precondition": "editorHasReferenceProvider",
    "category": "Go",
    "keybinding": {
      "primary": {
        "win": "Shift+F12",
        "linux": "Shift+F12",
        "mac": "Shift+F12"
      },
      "secondary": {
        "win": ["Ctrl+Shift+F12"],
        "linux": ["Ctrl+Shift+F12"],
        "mac": ["Cmd+Shift+F12"]
      },
      "when": "editorTextFocus"
    }
  }
]
```

### Keybinding Structure

- **primary**: Object with platform-specific keybindings (win/linux/mac)
- **secondary**: Array of alternative keybindings (optional)
- **when**: Context expression for when the keybinding is active
