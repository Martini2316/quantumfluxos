# QuantumFlux OS

A modern React-based operating system interface simulation inspired by classic desktop environments.

## Overview

QuantumFlux OS is a web-based desktop environment simulation built with React and modern web technologies. It recreates the nostalgic experience of classic operating systems while demonstrating modern front-end development patterns and techniques.

The project features a complete boot sequence, login screen, and functional desktop environment with draggable windows, a start menu, and application simulations.

## Features

### Currently Implemented

- **Boot Sequence**: Realistic system boot animation with progress bar and loading messages
- **Login Screen**: User authentication flow with animated transition
- **Desktop Environment**:

  - Custom wallpaper support
  - Draggable desktop icons with grid alignment
  - Multiple icon selection (via selection box or Ctrl+click)
  - Start menu with search functionality
  - System clock
  - Taskbar with minimized application indicators

- **Window Management System**:

  - Draggable and resizable windows
  - Window controls (minimize, maximize, close)
  - Window focus management (active window comes to front)
  - Window state persistence

- **Applications**:

  - **MemoPad**: A functional text editor with content auto-save
    - Minimization animation
    - Status bar with character count
    - Text editing capabilities

- **Desktop Icons**:
  - CommandX (terminal)
  - Recycling Bin
  - PixelStudio (graphics editor)
  - MemoPad (text editor)
  - FluxCode (code editor/IDE)

### Planned Features

- **File System**:

  - Virtual file storage and management
  - Persistent file storage using localStorage or IndexedDB
  - File operations (create, move, delete, rename)

- **Additional Applications**:

  - **FluxCode**: Code editor with syntax highlighting for multiple languages
  - **CommandX**: Terminal with basic command execution abilities
  - **PixelStudio**: Simple pixel art creation tool
  - **FileExplorer**: Browse and manage the virtual file system

- **System Features**:

  - Customizable themes and appearance settings
  - Virtual networking simulation
  - Notifications system
  - System sounds
  - Right-click context menus
  - Desktop widgets

- **Advanced Features**:
  - Simulated package manager for "installing" new applications
  - Multi-user support with different profiles
  - Screensaver functionality
  - System settings panel

## Technical Details

### Built With

- [React](https://reactjs.org/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [react-rnd](https://github.com/bokuweb/react-rnd) - Resizable and draggable components

### Project Structure

```
quantumflux/
├── public/
│   └── wallpaper/       # Desktop background images
│       └── default.png  # Default wallpaper
├── src/
│   ├── components/
│   │   ├── BootScreen.js     # Boot animation
│   │   ├── LoginScreen.js    # User login
│   │   ├── Desktop.js        # Main desktop environment
│   │   ├── MemoPad.js        # Text editor application
│   │   └── ...               # Other components
│   ├── App.js                # Main application controller
│   └── ...
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/Martini2316/quantumfluxos.git
   cd quantumfluxos
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create wallpaper directory
   ```bash
   mkdir -p public/wallpaper
   ```
4. Add a default wallpaper image to `public/wallpaper/default.png`

5. Start the development server

   ```bash
   npm start
   # or
   yarn start
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

## Usage

- **Boot**: When you first load the application, you'll see the boot screen
- **Login**: Click on the user to log in
- **Desktop**:
  - Double-click on icons to open applications
  - Use the Start button to open the start menu
  - Drag icons to rearrange them
  - Use selection box to select multiple icons
  - Minimize, maximize, or close application windows

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to suggest improvements or report bugs.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by classic desktop operating systems
- Created by Martin Schneider

---

**Note**: QuantumFlux OS is a simulation and not an actual operating system. It is intended as a demonstration of front-end development capabilities and a nostalgic tribute to classic desktop interfaces.
