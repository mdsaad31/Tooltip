# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Contributing documentation suite (CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md)
- Pull request template
- Issue templates (bug report, feature request, documentation)
- CONTRIBUTORS.md to recognize contributors
- CHANGELOG.md for version tracking

## [1.0.0] - 2025-01-XX

### Added
- Initial release of Tooltip - Privacy-first, all-in-one utility app
- Complete glassmorphism UI system with custom components
- Dark and light theme support with customizable accent colors
- Responsive navigation with floating dock
- IndexedDB integration with Dexie.js for local storage
- Command palette with keyboard shortcuts (⌘K/Ctrl+K)
- PWA support with offline functionality

#### Tools
- **Timer & Stopwatch**
  - Multiple timer support
  - Stopwatch functionality
  - Pomodoro timer mode
  - Custom timer presets
  - Advanced sound alerts with Web Audio API
  - Visual notifications
  
- **Calculator**
  - Basic arithmetic operations
  - Scientific mode with trigonometric functions
  - Memory operations (MS, MR, MC, M+, M-)
  - Keyboard support
  - Angle unit switching (radians/degrees)
  - Calculation history
  
- **QR Code Generator**
  - Multiple QR types (text, URL, WiFi, contact, SMS, email)
  - Advanced customization options
  - Color controls for foreground and background
  - Size adjustment
  - Error correction levels
  - Multiple export formats (PNG, JPEG, WebP, SVG)
  
- **Text Tools**
  - Case conversion (uppercase, lowercase, title case, sentence case)
  - Text transformation (reverse, alternating case)
  - Word and character count
  - Hash generation (MD5, SHA-1, SHA-256, SHA-512)
  - Base64 encoding/decoding
  - URL encoding/decoding
  - Text cleaning (remove extra spaces, remove line breaks)
  
- **Color Picker**
  - Interactive color selection
  - Multiple format support (HEX, RGB, HSL, HSV)
  - Color palette generation
  - Copy to clipboard
  
- **Unit Converter**
  - Length conversions
  - Weight conversions
  - Temperature conversions
  - Real-time conversion
  
- **Calendar**
  - Month view with date selection
  - Current date highlighting
  - Navigation between months
  
- **File Tools**
  - File information display
  - File metadata extraction
  - Size, type, and modification date
  
- **Quick Notes**
  - Fast note-taking
  - Local storage persistence
  - Note management (add, edit, delete)
  
- **Task Manager**
  - Simple to-do lists
  - Task completion tracking
  - Local storage persistence

#### UI Components
- GlassCard - Glassmorphic card component
- GlassButton - Glassmorphic button with variants
- GlassInput - Glassmorphic input field
- GlassModal - Glassmorphic modal dialogs
- GlassPanel - Glassmorphic panel container
- FloatingDock - Animated navigation dock with badges
- TimeCalendarWidget - Dashboard widget with time and calendar

#### Infrastructure
- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- pnpm for package management
- GitHub Actions for automated deployment
- GitHub Pages hosting configuration

### Changed
- Default theme changed to light mode (Clean Slate)
- Responsive button layouts with flex-wrap
- Improved QR code generator UI/UX

### Fixed
- Focus tab navigation in bottom dock
- Calculator button overflow on small screens
- Timer button overflow on small screens
- TypeScript compilation errors
- GitHub Actions workflow to use pnpm instead of npm

### Security
- Client-side only architecture with no server communication
- Local data storage with IndexedDB
- No analytics or tracking
- Content Security Policy considerations

## [0.1.0] - Development

### Added
- Initial project setup
- Basic project structure
- Core glassmorphism components
- Theme system foundation

---

## Version History Legend

### Types of Changes
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security improvements

### Version Numbers
- **MAJOR** version - Incompatible API changes
- **MINOR** version - Backwards-compatible functionality additions
- **PATCH** version - Backwards-compatible bug fixes

---

[Unreleased]: https://github.com/mdsaad31/Tooltip/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/mdsaad31/Tooltip/releases/tag/v1.0.0
[0.1.0]: https://github.com/mdsaad31/Tooltip/releases/tag/v0.1.0
