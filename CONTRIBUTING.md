# Contributing to Pozzo

Thank you for your interest in contributing to Pozzo! This document provides guidelines and workflows for contributing to the Pozzo landing page project.

---

## 1. Branching Strategy & Pull Request Workflow

We follow a Gitflow-inspired workflow where active development happens against the `develop` branch.

### 1.1 Branch Hierarchy
- **`main`**: Production branch deployed to GitHub Pages. Only stable releases are merged here via PR from `develop`.
- **`develop`**: Primary integration branch. All features, fixes, and documentation improvements branch off and merge back into `develop`.
- **Topic Branches**: Created for specific tasks using descriptive prefixes:
  - `feat/<feature-name>` or `feature/<feature-name>`: New landing page features or components.
  - `fix/<issue-name>`: Bug fixes and visual corrections.
  - `docs/<topic>`: Documentation, guides, or code comments.
  - `style/<scope>`: Purely stylistic or layout adjustments without functional changes.
  - `refactor/<scope>`: Code refactoring without behavioral changes.
  - `chore/<task>`: Tooling, dependency updates, or repository maintenance.

### 1.2 Step-by-Step PR Workflow
1. **Pull the latest `develop` branch**:
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **Create your topic branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make atomic, meaningful commits**:
   Follow the [Semantic Commit Guidelines](#2-semantic-commit-guidelines) below.
4. **Test locally**:
   Ensure all pages, themes, and translations work as intended using a local server.
5. **Push and open a Pull Request**:
   - Push your branch to the remote repository.
   - Open a Pull Request targeting the **`develop`** branch (never directly to `main`).
   - Provide a clear PR title and description outlining the changes made and testing performed.
6. **Code Review**:
   - All PRs require review and approval from at least one team member.
   - Automated CI checks (including `commit-policy.yml`) must pass before merging.

---

## 2. Semantic Commit Guidelines

Pozzo enforces the **Conventional Commits** specification. Commit messages are validated automatically via CI on every push and pull request.

### 2.1 Commit Message Format
```
<type>(<optional-scope>): <description>
```
Or without scope:
```
<type>: <description>
```

### 2.2 Allowed Commit Types
- `feat`: A new feature or component for the user.
- `fix`: A bug fix or visual defect correction.
- `docs`: Documentation updates, README changes, or code comments.
- `style`: Changes that do not affect code logic (formatting, missing semicolons, whitespace).
- `refactor`: Code changes that neither fix a bug nor add a feature.
- `perf`: A code change that improves performance or load time.
- `test`: Adding or correcting tests.
- `build`: Changes that affect the build system or external tooling.
- `ci`: Changes to CI configuration files and scripts (e.g., GitHub Actions).
- `chore`: Other changes that do not modify `src` or test files.
- `revert`: Reverting a previous commit.

### 2.3 Commit Message Rules
- **Subject line**:
  - Written in English.
  - Use the imperative, present tense ("add", "fix", "update", not "added", "fixes", "updating").
  - Lowercase first letter after the colon.
  - No trailing period (`.`).
- **Tool Trailers Policy**:
  - Commits must be authored by team members.
  - Automated AI tool signatures or trailers (e.g., `Co-authored-by: ... <copilot>`, `Generated with ...`) are strictly prohibited and will be rejected by CI.

---

## 3. Code Formatting and Standards

The landing page is built with vanilla web technologies (HTML5, CSS3, ES6+ JavaScript) without a build step or external frontend frameworks.

### 3.1 General Guidelines
- Use **2 spaces** for indentation across all files.
- Use **UTF-8** encoding and **LF** line endings.
- Keep files organized, clean, and self-documenting.

### 3.2 HTML Guidelines
- Use semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`, `<aside>`).
- Maintain accessibility (WCAG AA standard):
  - Every form input must have an associated `<label>`.
  - Include informative `alt` attributes on images (`alt=""` only for purely decorative images).
  - Use ARIA roles and attributes (`aria-label`, `aria-expanded`, `aria-hidden`, `aria-describedby`) appropriately.
  - Ensure keyboard navigability and focus states.
- Demarcate major sections with clear HTML comments.
- Always use `data-i18n` attributes for translatable strings.

### 3.3 CSS Guidelines
- Follow a modular, component-based methodology (BEM-inspired: `.block__element--modifier`).
- Utilize CSS custom properties defined on `:root` for typography, spacing, colors, and elevations.
- Support both light and dark themes via `prefers-color-scheme` and explicit `[data-theme="dark"]` selectors.
- Practice mobile-first responsive design using media queries (`min-width`).
- Avoid inline styles or `!important` declarations.

### 3.4 JavaScript Guidelines
- Write vanilla JavaScript using modern ES6+ standards.
- Wrap scripts in an Immediately Invoked Function Expression (IIFE) with `"use strict";` to avoid polluting the global scope.
- Use meaningful, descriptive function and variable names.
- Document functions and major event handlers with JSDoc-style comments explaining parameters, return values, and behavior.
- Handle DOM manipulations safely (check for element existence before attaching listeners or mutating classes).

### 3.5 Localization (i18n) Guidelines
- All user-facing text must be externalized into `i18n/EN.json` (English) and `i18n/ES.json` (Spanish).
- When adding or modifying keys:
  - Keep keys identical across both dictionary files.
  - Use hierarchical dot notation (e.g., `section.component.label`).
  - Use `{placeholder}` syntax for dynamic text interpolation.
  - Test the UI in both English and Spanish to verify text rendering and avoid layout shifts.

---

## 4. Local Preview & Verification

To verify your changes locally:
1. Run a local web server (required because i18n JSON files are loaded asynchronously via `fetch`):
   ```bash
   # Python 3
   python -m http.server 8000

   # Or Node.js
   npx serve .
   ```
2. Open `http://localhost:8000` in your web browser.
3. Test key interactions:
   - Language switching (EN / ES).
   - Theme switching (Light / Dark).
   - Responsive layout at mobile, tablet, and desktop breakpoints.
   - Waitlist form validation and mailto fallback mechanism.
   - Smooth navigation between sections and legal pages (`terms.html`, `privacy.html`).
