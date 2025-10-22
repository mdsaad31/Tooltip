# Contributing to Tooltip

First off, thank you for considering contributing to Tooltip! It's people like you that make Tooltip such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by the [Tooltip Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- pnpm (v10 or higher)
- Git

### Setting Up Your Development Environment

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Tooltip.git
   cd Tooltip
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/mdsaad31/Tooltip.git
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173/` to see the app running.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots or animated GIFs if possible**
- **Include your browser and OS information**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any similar features in other applications**

### Your First Code Contribution

Unsure where to begin? You can start by looking through issues labeled:

- `good first issue` - Issues that should only require a few lines of code
- `help wanted` - Issues that may be more involved but are good for contributors

### Pull Requests

- Fill in the required template
- Follow the [style guidelines](#style-guidelines)
- Write clear, descriptive commit messages
- Include screenshots in your pull request when making UI changes
- End all files with a newline
- Avoid platform-dependent code

## Development Workflow

### Branch Naming Convention

- `feature/feature-name` - For new features
- `fix/bug-description` - For bug fixes
- `docs/description` - For documentation changes
- `refactor/description` - For code refactoring
- `test/description` - For adding or updating tests

### Development Process

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   
   Follow the [style guidelines](#style-guidelines) and write clean, maintainable code.

3. **Test your changes**
   ```bash
   pnpm run build
   pnpm run preview
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add awesome feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   
   Go to the original repository and click "New Pull Request".

## Style Guidelines

### TypeScript Style Guide

- Use TypeScript for all new code
- Use interfaces over types when possible
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add comments for complex logic
- Use arrow functions for callbacks

```typescript
// Good
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Avoid
function calculateTotal(items) {
  var sum = 0;
  for (var i = 0; i < items.length; i++) {
    sum = sum + items[i].price;
  }
  return sum;
}
```

### React Component Guidelines

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful prop names
- Add prop types/interfaces

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

### CSS/TailwindCSS Guidelines

- Use TailwindCSS utility classes
- Follow mobile-first responsive design
- Use the glassmorphism components from `ui/GlassComponents.tsx`
- Maintain consistent spacing and sizing
- Use theme colors and variables

### File Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── tools/           # Tool components
│   ├── dock/            # Navigation components
│   └── layout/          # Layout components
├── contexts/            # React contexts
├── lib/                 # Utilities and helpers
└── assets/              # Static assets
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```bash
feat(calculator): add scientific mode with trigonometric functions

- Added sin, cos, tan functions
- Added support for radians and degrees
- Updated UI with new button layout

Closes #123
```

```bash
fix(timer): resolve notification sound playing multiple times

The notification sound was triggering multiple times due to 
duplicate useEffect dependencies.

Fixes #456
```

## Pull Request Process

1. **Update documentation** - Ensure README.md and other docs are updated if needed
2. **Update CHANGELOG** - Add your changes to the unreleased section
3. **Self-review your code** - Check for any issues before requesting review
4. **Request review** - Tag maintainers for review
5. **Address feedback** - Make requested changes promptly
6. **Wait for approval** - At least one maintainer must approve
7. **Merge** - Maintainers will merge your PR

### Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes
```

## Additional Notes

### Adding New Tools

When adding a new tool:

1. Create component in `src/components/tools/`
2. Add icon import to `App.tsx`
3. Register tool in `toolCategories` object
4. Add route case in `renderContent` function
5. Update documentation

### Working with IndexedDB

- Use Dexie.js wrapper (`src/lib/database.ts`)
- Always handle errors appropriately
- Test with actual data
- Consider data migration if schema changes

### PWA Considerations

- Test offline functionality
- Ensure service worker updates correctly
- Verify manifest.json changes
- Test on mobile devices

## Questions?

Feel free to:
- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Reach out to maintainers

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special acknowledgments for major features

---

**Thank you for contributing to Tooltip! Your efforts help make privacy-first tools accessible to everyone.** 🚀
