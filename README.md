# Tooltip - All-in-One Utility App

**"All your everyday tools — beautifully unified, right on your device."**

Tooltip is a lightweight, privacy-first, all-in-one utility app built with React, TypeScript, and TailwindCSS. It features a stunning glassmorphism design and stores everything locally—no cloud, no accounts, no tracking.

## 🌟 Features

- **Privacy-First**: 100% local storage using IndexedDB
- **Beautiful Design**: Glassmorphism-inspired UI with smooth animations
- **PWA Support**: Works offline and can be installed as a desktop app
- **Dark/Light Themes**: Automatic theme switching with customizable accent colors
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **No Dependencies**: All tools work locally without internet connection

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: TailwindCSS with custom glassmorphism components
- **Storage**: IndexedDB with Dexie.js wrapper
- **Build Tool**: Vite
- **PWA**: Vite PWA plugin for offline functionality
- **Icons**: Lucide React
- **Animations**: CSS transitions and keyframes

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tooltip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Deploy to GitHub Pages**
   ```bash
   npm run deploy
   ```

## 🌐 GitHub Pages Deployment

This project is configured for easy deployment to GitHub Pages:

### Automatic Deployment
- Push to the `main` branch triggers automatic deployment via GitHub Actions
- The app will be available at `https://<username>.github.io/Tooltip/`

### Manual Deployment
1. Ensure you have gh-pages installed: `npm install -D gh-pages`
2. Run: `npm run deploy`
3. Enable GitHub Pages in repository settings (Settings > Pages > Source: gh-pages branch)

### Configuration
- Base path is set to `/Tooltip/` in `vite.config.ts`
- GitHub Actions workflow is in `.github/workflows/deploy.yml`
- Requires GitHub Pages to be enabled in repository settings

## 🎨 Design System

### Glassmorphism Components
- `GlassCard` - Translucent cards with blur effects
- `GlassButton` - Interactive glass buttons with hover states
- `GlassInput` - Form inputs with glass styling
- `GlassModal` - Floating modal dialogs
- `GlassPanel` - Content panels with headers and actions

### Layout Components
- `AppLayout` - Main application layout with background
- `GridLayout` - Responsive grid system
- `StackLayout` - Flexible stacking layout
- `Container` - Content containers with max-width

### Navigation
- `FloatingDock` - macOS-style floating dock navigation
- Badge support for notifications
- Smooth hover animations and transitions

## 📱 Available Tools

### Dashboard Hub ✅
- Translucent widget-based dashboard
- Quick access to frequently used tools
- Interactive widgets for notes and tasks
- Real-time data from local IndexedDB
- Command palette (⌘K/Ctrl+K) for quick actions

### Quick Notes ✅
- Fast note-taking interface
- Local storage with IndexedDB
- Add, edit, and delete notes
- Glassmorphism UI design

### Task Management ✅
- Simple to-do lists
- Add, edit, complete tasks
- Local storage and persistence
- Clean interface

### Timer & Stopwatch ✅
- **Multiple Timer Mode** - Run several timers simultaneously
- **Timer Presets** - Quick access to common durations
- **Pomodoro Timer** - 25-min work sessions with breaks
- **Advanced Sound Alerts** - Multiple notification sounds with volume control
- **Stopwatch** - With lap tracking
- Notifications when timers complete

### Calculator ✅
- **Basic Mode** - Standard calculator operations
- **Scientific Mode** - Trigonometric functions, logarithms, exponentials
- **Memory Operations** - Store, recall, add, subtract
- **Advanced Functions** - Square root, power, factorial, π, e
- Calculation history
- Full keyboard support

### QR Code Generator ✅
- **Multiple QR Types** - Text, URL, WiFi, Contact, SMS, Email
- **Advanced Customization** - Colors, sizes, error correction
- **Multiple Formats** - Export as PNG, JPEG, WebP, SVG
- Download and copy to clipboard
- Real-time preview

### Text Tools ✅
- Case conversion (upper, lower, title, sentence)
- Word and character counting
- Text reversal and sorting
- Hash generation (MD5, SHA-1, SHA-256)
- Lorem ipsum generator
- Base64 encoding/decoding
- URL encoding/decoding
- Text diff comparison

### Color Picker ✅
- Multiple color format support (HEX, RGB, HSL, HSV)
- Color palette generation
- Color history
- Copy to clipboard

### Unit Converter ✅
- Length, weight, temperature conversions
- Multiple unit support
- Real-time conversion

### File Tools ✅
- File information and metadata
- Local processing (no uploads)

### Calendar ✅
- Month view calendar
- Date selection
- Clean interface

## 🎯 Project Status

- [x] **Project Setup & Architecture** - Core infrastructure and build system
- [x] **Core UI Framework & Theme System** - Glassmorphism components and theme provider
- [x] **Dashboard Hub & Navigation** - Command palette and widget system
- [x] **Local Storage System** - IndexedDB implementation with Dexie.js
- [x] **Interactive Modals** - Add/edit forms for notes and tasks
- [ ] **Notes & Documentation Tool** - Rich-text editor and full notes management
- [ ] **Task Manager & Calendar** - Full task management and calendar integration
- [ ] **Quick Utilities Suite** - Calculator, converter, etc.
- [ ] **File Tools (Local Processing)** - PDF and image tools
- [ ] **Focus Mode & Productivity** - Pomodoro timer functionality
- [ ] **PWA & Offline Optimization** - Service worker and caching

## 🔒 Privacy Commitment

- **No cloud storage** - Everything stays on your device
- **No user accounts** - No sign-up required
- **No tracking** - No analytics or telemetry
- **No ads** - Clean, distraction-free interface
- **Open source** - Transparent and auditable code

## 🎨 Customization

Tooltip supports extensive customization:
- **Themes**: Light, dark, or auto (system preference)
- **Accent Colors**: Azure, Mint, Lavender
- **Transparency**: Adjustable glass effect intensity
- **Layout**: Customizable widget arrangement

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for privacy-conscious users who want beautiful, functional tools without compromising their data.**
