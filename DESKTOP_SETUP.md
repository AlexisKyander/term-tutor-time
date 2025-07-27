# Term Tutor Time - Desktop App Setup

This vocabulary learning app can be run as a desktop application using Electron.

## Prerequisites

Make sure you have Node.js installed on your computer.

## Setup Instructions

1. **Clone the repository** (after connecting to GitHub):
   ```bash
   git clone [your-repo-url]
   cd [repo-name]
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Desktop App

### Development Mode
To run the app in development mode with hot-reload:
```bash
node scripts/electron-dev.js
```

### Production Mode
To run the built version:
```bash
node scripts/electron-pack.js
```

## Features

The desktop app includes:
- Native desktop window with proper menus
- Keyboard shortcuts (Ctrl+Q to quit, etc.)
- Automatic window sizing and minimum dimensions
- All the vocabulary learning features from the web version

## Notes

- The app will automatically open in a desktop window
- You can close it like any other desktop application
- Data is stored locally in your browser's storage within the Electron app
- The app works offline once loaded