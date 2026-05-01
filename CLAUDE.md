# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static HTML study guide for AP Physics C: Electricity & Magnetism. Five unit pages + landing page, all rendered with MathJax (LaTeX) and a glassmorphism CSS theme. No build step, no framework — just HTML, CSS, and vanilla JS.

## Running locally

```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

Or double-click `index.html` to open directly (no server needed for basic browsing).

## File structure

```
physicsEM/
├── index.html                    # Landing page — unit cards, CB mapping, exam strategy, practice links
├── unit1-electrostatics.html     # CB Units 8-10 (15 sections)
├── unit2-circuits.html           # CB Unit 11 (9 sections)
├── unit3-magnetism.html          # CB Unit 12 (6 sections)
├── unit4-electromagnetism.html   # CB Unit 13 + induction (8 sections)
├── unit5-maxwell.html            # Maxwell's equations + EM waves (5 sections)
├── css/style.css                 # Single-file stylesheet (glassmorphism theme)
├── js/app.js                     # Single-file JS (IIFE, no framework)
└── E&M practice/                 # PDF practice tests, quizzes, notes
```

## Page anatomy

Each unit page follows this pattern for every topic section:

```html
<section id="X.Y-topic-slug" class="glass-card content-section">
  <div class="section-header">
    <input type="checkbox" class="progress-check" data-section="X.Y">
    <h2>X.Y Topic Name</h2>
    <button class="collapse-toggle">▼</button>
  </div>
  <div class="section-body">
    <!-- concept text, equation-block divs, callout divs -->
  </div>
</section>

<!-- Practice blocks follow each section: -->
<div class="glass-card practice-block">
  <div class="practice-header"><span class="glass-badge">Practice</span><h3>Q1.N: Title</h3></div>
  <div class="practice-question"><p>Problem statement</p></div>
  <details class="solution"><summary class="glass-btn">Show Solution</summary>
    <div class="solution-content"><div class="step">...</div></div>
  </details>
</div>
```

## CSS design system

- **Theme**: Glassmorphism with CSS custom properties defined in `:root` and `[data-theme="dark"]`
- **Key classes**: `glass-card`, `glass-nav`, `glass-btn`, `glass-badge`
- **Utility classes**: `callout--tip`, `callout--warning`, `callout--danger`
- **Equations** use `class="equation-block"` wrapping MathJax `$$...$$`
- **Responsive**: Mobile sidebar collapses at 768px via media queries

## JavaScript architecture (`js/app.js`)

Single IIFE with controller objects initialized at DOM ready:

| Module | Responsibility |
|--------|---------------|
| `StateManager` | localStorage read/write for theme and section progress |
| `DarkModeController` | `data-theme` toggling on `<html>`, button icon swap |
| `NavController` | Active link highlighting, prev/next/goToUnit navigation |
| `SidebarController` | Builds TOC from `.content-section[id]` headings, IntersectionObserver scroll spy |
| `SectionCollapse` | Collapse/expand `.content-section` via `.collapsed` class toggle |
| `ProgressCheckboxes` | Per-section checkboxes synced to localStorage, updates progress bar |
| `SearchFilter` | Client-side text filtering of sections and practice blocks (debounced 200ms) |
| `KeyboardController` | Shortcuts: `0/H`=home, `1-5`=units, `←→`=prev/next, `T`=theme, `/`=search |
| `LandingPage` | Reads progress from localStorage to fill unit card progress bars |
| `MobileMenu` / `MobileSidebar` | Hamburger menu and sidebar backdrop for mobile |

**Unit page config** (`UNIT_PAGES` array): Each entry has `id`, `file`, `num`, `label`, `weight`. Used by nav, keyboard, and landing page controllers.

## MathJax

Loaded from CDN: `tex-mml-chtml.js`. Inline math uses `\(...\)`, display math uses `$$...$$`. New equation blocks should follow the existing pattern with `class="equation-block"`.

## Progress tracking

Checkboxes have `data-section` attributes (e.g., `data-section="1.1"`). State is stored in localStorage under key `ap-em-progress` as `{ "unit1": ["1.1", "1.2"], ... }`. Landing page aggregates across units to show per-card percentages.

## Practice PDF directory naming

PDFs are in `E&M practice/` with folder names that follow a different unit numbering system (Units 7-11) than the study guide. The `index.html` Practice Materials Directory maps CB unit numbers to these folders:

| CB Unit | Folder |
|---------|--------|
| Unit 8 (Electrostatics) | `E&M practice/Electrostatic/` |
| Unit 9 (Electric Potential) | `E&M practice/potential/` |
| Unit 10 (Circuits) | `E&M practice/Circuits/` |
| Unit 11 (Magnetism) | `E&M practice/Magnetism/` |
| Unit 12-13 (Induction) | `E&M practice/New Folder With Items/` |